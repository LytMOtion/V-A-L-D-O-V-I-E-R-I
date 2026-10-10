export function motionAllowed({reduced = false, saveData = false, staticRequested = false} = {}) {
  return !reduced && !saveData && !staticRequested;
}

// A lightweight image-based depth study, not a physical cloth simulation.
export async function startTextileMotion({surface, still, canvas, toggle, unavailable = false}) {
  await still.decode();
  const gl = unavailable ? null : canvas.getContext('webgl', {alpha:false, antialias:false, preserveDrawingBuffer:true, powerPreference:'low-power'});
  if (!gl) throw new Error('WebGL unavailable');
  const vertex = `attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
  const fragment = `precision highp float;uniform sampler2D photo;uniform vec4 crop;uniform float seconds;varying vec2 uv;
    void main(){
      vec2 sampleUV=crop.xy+uv*crop.zw;
      vec3 original=texture2D(photo,sampleUV).rgb;
      float relief=dot(original,vec3(.2126,.7152,.0722));
      vec2 camera=vec2(sin(seconds*.11),sin(seconds*.075))*.003*(.25+relief);
      vec3 color=texture2D(photo,clamp(sampleUV+camera,vec2(.001),vec2(.999))).rgb;
      float slowLight=sin(seconds*.18)*.035+sin(seconds*.12)*(smoothstep(.2,.85,sampleUV.x)-.5)*.10;
      gl_FragColor=vec4(color*(1.+slowLight),1.);
    }`;
  const compile = (type, source) => {
    const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw new Error('Shader unavailable');}
    return shader;
  };
  const vs=compile(gl.VERTEX_SHADER,vertex), fs=compile(gl.FRAGMENT_SHADER,fragment);
  const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Renderer unavailable');
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,still);
  gl.uniform1i(gl.getUniformLocation(program,'photo'),0);
  const crop=gl.getUniformLocation(program,'crop'), time=gl.getUniformLocation(program,'seconds');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,elapsed=0,last=0,lastDraw=0,frames=0,cost=0,activeMs=0,paused=false,inView=true,disposed=false;
  const resize = () => {
    const box=surface.getBoundingClientRect();const pixels=Math.min(devicePixelRatio||1,1.5,Math.sqrt(1400000/(box.width*box.height)));
    canvas.width=Math.round(box.width*pixels);canvas.height=Math.round(box.height*pixels);gl.viewport(0,0,canvas.width,canvas.height);
    const target=box.width/box.height,source=still.naturalWidth/still.naturalHeight;
    let w=1,h=1;if(target<source)w=target/source;else h=source/target;
    const anchor=box.width<=600?.70:.65;
    gl.uniform4f(crop,(1-w)*anchor,(1-h)*.5,w,h);
    gl.uniform1f(time,elapsed);gl.drawArrays(gl.TRIANGLES,0,6);
    surface.dataset.canvasSize=`${canvas.width}x${canvas.height}`;
  };
  const stop = () => {cancelAnimationFrame(frame);frame=0;last=0;lastDraw=0;};
  const dispose = reason => {
    if(disposed)return;disposed=true;stop();canvas.hidden=true;toggle.hidden=true;surface.dataset.motion=reason;
    observer?.disconnect();removeEventListener('resize',resize);document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',onReduce);
    gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
  };
  const draw = stamp => {
    if(disposed||paused||!inView||document.hidden)return;
    if(last){activeMs+=stamp-last;elapsed+=Math.min((stamp-last)/1000,.06);}last=stamp;
    if(stamp-lastDraw>=32){
      const start=performance.now();gl.uniform1f(time,elapsed);gl.drawArrays(gl.TRIANGLES,0,6);
      cost+=performance.now()-start;lastDraw=stamp;frames++;
      if(frames%30===0){surface.dataset.frames=String(frames);surface.dataset.cpuSubmitMeanMs=(cost/frames).toFixed(2);surface.dataset.activeFrameMeanMs=(activeMs/frames).toFixed(2);surface.dataset.elapsed=elapsed.toFixed(2);}
      if(frames===90&&(cost/frames>24||activeMs/frames>80)){dispose('performance-static');return;}
    }
    frame=requestAnimationFrame(draw);
  };
  const sync = () => {stop();if(!disposed&&!paused&&inView&&!document.hidden){surface.dataset.motion='running';frame=requestAnimationFrame(draw);}else if(!disposed)surface.dataset.motion=paused?'paused':'offscreen';};
  const onReduce = () => {if(reduced.matches)dispose('reduced-motion');};
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:0}) : null;
  observer?.observe(surface);
  toggle.addEventListener('click',()=>{paused=!paused;toggle.setAttribute('aria-pressed',String(paused));toggle.textContent=paused?'Resume atmosphere':'Pause atmosphere';sync();});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();dispose('context-lost-static');},{once:true});
  addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',onReduce);
  resize();canvas.hidden=false;toggle.hidden=false;surface.dataset.motion='running';sync();
  return {dispose};
}
