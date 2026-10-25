/* VOID CORE — procedural real-time background. Local Three.js r160, no asset/CDN requests.
   Change the palette/geometry below without touching the page layout or portfolio logic. */
(() => {
    'use strict';
    const T = window.THREE;
    const hero = document.getElementById('hero');
    const canvas = document.getElementById('heroCanvas');
    const toggle = document.getElementById('sceneToggle');
    if (!T || !hero || !canvas) return;
    let renderer;
    try {
        renderer = new T.WebGLRenderer({ canvas, alpha: false, antialias: false, powerPreference: 'high-performance' });
    } catch { hero.dataset.sceneState = 'fallback'; return; }
    try { createScene(); } catch (error) {
        renderer.dispose();
        hero.classList.remove('scene-ready');
        hero.dataset.sceneState = 'fallback';
        toggle.hidden = true;
        console.warn('Background fallback:', error.message);
    }

    function createScene() {
        const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
        const scene = new T.Scene();
        scene.background = new T.Color('#070c12');
        scene.fog = new T.FogExp2('#070c12', .048);
        const camera = new T.PerspectiveCamera(40, 1, .1, 65);
        renderer.outputColorSpace = T.LinearSRGBColorSpace;
        renderer.toneMapping = T.NoToneMapping;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        renderer.setPixelRatio(1);
        let seed = 173;
        const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

        // A small generated studio environment gives bevels soft, physically shaded reflections.
        function createEnvironment() {
        const studio = new T.Scene();
        studio.background = new T.Color('#1b242c');
        const studioGeometries = [];
        const studioMaterials = [];
        for (const [x, y, z, w, h, color, strength] of [
            [-5, 4, 4, 3, 7, '#d4f0ff', 3], [5, 2, 1, 2, 9, '#e7ccb0', 3],
            [0, 6, -4, 8, 3, '#b2d4dc', 2], [-3, -3, 0, 4, 3, '#1b333f', .5]
        ]) {
            const geometry = new T.PlaneGeometry(w, h);
            const material = new T.MeshBasicMaterial({ color: new T.Color(color).multiplyScalar(strength), side: T.DoubleSide });
            const panel = new T.Mesh(geometry, material);
            panel.position.set(x, y, z); panel.lookAt(0, 0, 0); studio.add(panel);
            studioGeometries.push(geometry); studioMaterials.push(material);
        }
        const pmrem = new T.PMREMGenerator(renderer);
        const environment = pmrem.fromScene(studio, .08, .1, 40);
        pmrem.dispose(); studioGeometries.forEach(g => g.dispose()); studioMaterials.forEach(m => m.dispose());
        return environment;
        }
        let environment = createEnvironment();
        scene.environment = environment.texture;

        const textureCanvas = document.createElement('canvas');
        textureCanvas.width = textureCanvas.height = 128;
        const textureContext = textureCanvas.getContext('2d');
        const pixels = textureContext.createImageData(128, 128);
        for (let i = 0; i < pixels.data.length; i += 4) {
            const value = 115 + random() * 80;
            pixels.data.set([value, value, value, 255], i);
        }
        textureContext.putImageData(pixels, 0, 0);
        const grain = new T.CanvasTexture(textureCanvas);
        grain.wrapS = grain.wrapT = T.RepeatWrapping;
        grain.repeat.set(3, 5);
        const dark = new T.MeshStandardMaterial({ color: '#29373c', roughness: .46, metalness: .83, envMapIntensity: 1.25, bumpMap: grain, bumpScale: .014 });
        const stone = new T.MeshStandardMaterial({ color: '#344349', roughness: .83, metalness: .28, bumpMap: grain, bumpScale: .035 });
        const edgeMetal = new T.MeshStandardMaterial({ color: '#8ca2a5', roughness: .25, metalness: .94, envMapIntensity: 1.4 });
        const brass = new T.MeshStandardMaterial({ color: '#9c7950', roughness: .36, metalness: .88, envMapIntensity: 1.35 });
        const cold = new T.MeshBasicMaterial({ color: new T.Color('#a4fff0').multiplyScalar(2.8) });
        const warm = new T.MeshBasicMaterial({ color: new T.Color('#f8c58a').multiplyScalar(2.6) });

        const unitGeometry = new T.BoxGeometry(1, 1, 1);
        function box(parent, size, position, material = dark, bevel = false) {
            let geometry = unitGeometry;
            if (bevel) {
                const [w, h, d] = size, b = Math.min(w, h, d) * .13;
                const shape = new T.Shape();
                shape.moveTo(-w/2+b, -h/2+b); shape.lineTo(w/2-b, -h/2+b);
                shape.lineTo(w/2-b, h/2-b); shape.lineTo(-w/2+b, h/2-b); shape.closePath();
                geometry = new T.ExtrudeGeometry(shape, { depth: d-2*b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 1, steps: 1, curveSegments: 1 });
                geometry.translate(0, 0, -d/2+b);
            }
            const mesh = new T.Mesh(geometry, material);
            if (!bevel) mesh.scale.set(...size);
            mesh.position.set(...position);
            mesh.castShadow = material !== cold && material !== warm;
            mesh.receiveShadow = true;
            parent.add(mesh);
            return mesh;
        }
        function arc(parent, radius, start, length, material, thickness = .012, z = 0) {
            const geometry = new T.TorusGeometry(radius, thickness, 5, Math.max(24, Math.round(length * 42)), length);
            const mesh = new T.Mesh(geometry, material);
            mesh.rotation.z = start; mesh.position.z = z; parent.add(mesh); return mesh;
        }
        const assembly = new T.Group(); scene.add(assembly);
        const core = new T.Group(); assembly.add(core);
        core.rotation.set(.06, -.38, -.12);

        // Broken architecture: layered lintels and pillars, an open chamber and suspended keystone.
        const floating = [];
        const pillarParts = [
            [[.57,1.8,.79],[-1.12,-.79,.08],.035], [[.57,1.96,.79],[-1.18,1.15,.04],-.04],
            [[.67,2.35,.95],[1.22,-.42,-.02],-.02], [[.67,1.23,.95],[1.3,1.53,-.01],.05],
            [[2.02,.43,.87],[-.17,2.32,.02],.065], [[1.7,.44,.86],[.29,-2.04,.06],-.035]
        ];
        pillarParts.forEach(([size, pos, angle], i) => {
            const part = new T.Group(); core.add(part); part.position.set(...pos); part.rotation.z = angle;
            box(part, size, [0,0,0], i % 3 ? dark : stone, true);
            const vertical = size[1] > size[0];
            box(part, vertical ? [.018,size[1]*.84,.02] : [size[0]*.84,.018,.02], [vertical ? size[0]*.3 : 0,0,size[2]/2+.012], i === 2 || i === 5 ? warm : cold);
            for (let j = 0; j < 4; j++) {
                box(part, vertical ? [size[0]*.64,.015,.025] : [.015,size[1]*.64,.025], vertical ? [0,-size[1]*.3+j*size[1]*.2,size[2]/2+.01] : [-size[0]*.3+j*size[0]*.2,0,size[2]/2+.01], edgeMetal);
            }
            floating.push({ mesh: part, y: pos[1], phase: i*1.6, amount: .04 });
        });

        // Recurring frames make the void feel deep instead of flat.
        const innerFrames = [];
        for (let i = 0; i < 6; i++) {
            const frame = new T.Group(); frame.position.z = -.18-i*.25;
            const width = 1.8-i*.12, height = 3.55-i*.2;
            for (const side of [-1,1]) {
                box(frame, [.032,height,.035], [side*width/2,0,0], i % 2 ? edgeMetal : cold);
                box(frame, [width,.032,.035], [0,side*height/2,0], i % 2 ? edgeMetal : cold);
            }
            core.add(frame); innerFrames.push(frame);
        }
        const keystone = new T.Group(); core.add(keystone);
        box(keystone, [.66,2.5,.66], [-.12,.1,.15], dark, true);
        box(keystone, [.032,2.15,.68], [.23,.1,.15], cold);
        box(keystone, [.11,2.7,.73], [.35,.18,.15], edgeMetal, true);
        const crown = box(keystone, [.68,.48,.68], [-.13,1.78,.15], stone, true); crown.rotation.set(.06,.15,.1);
        const foot = box(keystone, [.51,.35,.57], [-.12,-1.57,.15], dark, true); foot.rotation.set(.03,-.15,-.14);

        const halo = new T.Group(); halo.rotation.set(.1,.58,.23); assembly.add(halo);
        arc(halo,3.15,.2,4.55,edgeMetal,.012,-.1);
        arc(halo,3.21,1.3,2.5,brass,.02,-.08);
        arc(halo,3.08,4.55,1.05,cold,.007,0);
        for (let i = 0; i < 64; i++) {
            const a = i/64*Math.PI*2;
            if (i > 20 && i < 28 || i > 50 && i < 54) continue;
            const piece = box(halo,[i%8===0?.065:.018,i%8===0?.22:.1,.038],[Math.cos(a)*3.15,Math.sin(a)*3.15,-.1],i%8===0?brass:edgeMetal);
            piece.rotation.z = a-Math.PI/2;
        }
        const tiltedRing = new T.Group(); tiltedRing.rotation.set(1.15,-.3,-.35); assembly.add(tiltedRing);
        arc(tiltedRing,2.7,.35,4.7,brass,.016);
        arc(tiltedRing,2.72,5.25,.65,warm,.008);

        const debris = new T.Group(); assembly.add(debris);
        for (let i = 0; i < 29; i++) {
            const angle = random()*Math.PI*2, radius = 2.35+random()*1.2;
            const size = .06+random()*.18;
            const mesh = box(debris,[size,size*(1+random()*2.6),size*.8],[Math.cos(angle)*radius,Math.sin(angle)*radius*.81,(random()-.5)*2.5],i%6===0?brass:dark,true);
            mesh.rotation.set(random()*2,random()*2,random()*2);
            floating.push({mesh,y:mesh.position.y,phase:random()*6,amount:.06+random()*.1});
        }

        // Grounded shadow, engraved circular floor and two distant architectural silhouettes.
        const floor = new T.Mesh(new T.PlaneGeometry(90,90), new T.MeshStandardMaterial({color:'#101b21',metalness:.58,roughness:.6,envMapIntensity:.2}));
        floor.rotation.x = -Math.PI/2; floor.position.y = -2.95; floor.receiveShadow = true; scene.add(floor);
        const base = new T.Group(); assembly.add(base); base.position.y=-2.85;
        const plinth = new T.Mesh(new T.CylinderGeometry(2.08,2.32,.16,80),dark); base.add(plinth); plinth.receiveShadow=true;
        const groundRing = new T.Group(); groundRing.rotation.x=-Math.PI/2; groundRing.position.y=.1; base.add(groundRing);
        arc(groundRing,2.1,0,Math.PI*2,edgeMetal,.009);
        arc(groundRing,2.28,.1,2.9,cold,.006);
        arc(groundRing,2.8,.2,Math.PI*1.8,new T.MeshBasicMaterial({color:'#274248'}),.008);

        const ambient = new T.HemisphereLight('#a2cfd9','#0c131a',.8); scene.add(ambient);
        const key = new T.DirectionalLight('#d0e8ef',3.5); key.position.set(-3,7,6); scene.add(key);
        key.castShadow = true; key.shadow.mapSize.set(1024,1024);
        Object.assign(key.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.5,far:25}); key.shadow.bias=-.0006;
        const rim = new T.DirectionalLight('#d6ac72',3); rim.position.set(7,3,-2); scene.add(rim);
        const coreLight = new T.PointLight('#8cffe9',6,7,2); coreLight.position.set(.4,0,.6); assembly.add(coreLight);
        const floorLight = new T.PointLight('#51bac7',9,8,2); floorLight.position.set(0,-2.4,.5); assembly.add(floorLight);

        // Light haze: generated radial sprites, no images or texture requests.
        const glowCanvas=document.createElement('canvas'); glowCanvas.width=glowCanvas.height=128;
        const glowContext=glowCanvas.getContext('2d');
        const gradient=glowContext.createRadialGradient(64,64,0,64,64,64);
        gradient.addColorStop(0,'rgba(170,255,237,.4)'); gradient.addColorStop(.25,'rgba(112,220,222,.12)'); gradient.addColorStop(1,'rgba(70,180,210,0)');
        glowContext.fillStyle=gradient; glowContext.fillRect(0,0,128,128);
        const glowTexture=new T.CanvasTexture(glowCanvas);
        const hazeMaterial=new T.SpriteMaterial({map:glowTexture,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:.4});
        const haze=new T.Sprite(hazeMaterial); haze.scale.set(10,10,1); haze.position.set(0,.5,-2.2); assembly.add(haze);
        const dustGeometry=new T.BufferGeometry();
        const positions=new Float32Array(180*3);
        for(let i=0;i<180;i++){positions[i*3]=(random()-.35)*19;positions[i*3+1]=(random()-.5)*10;positions[i*3+2]=(random()-.5)*14;}
        dustGeometry.setAttribute('position',new T.BufferAttribute(positions,3));
        const dust=new T.Points(dustGeometry,new T.PointsMaterial({color:'#a7d3d2',size:.018,transparent:true,opacity:.48,depthWrite:false,blending:T.AdditiveBlending})); scene.add(dust);

        // Half-resolution glow pass, followed by filmic tone mapping and subtle grain.
        const targetType=renderer.extensions.has('EXT_color_buffer_float')?T.HalfFloatType:T.UnsignedByteType;
        const sceneTarget=new T.WebGLRenderTarget(1,1,{type:targetType,depthBuffer:true,samples:renderer.capabilities.isWebGL2?4:0});
        const blurA=new T.WebGLRenderTarget(1,1,{type:targetType,depthBuffer:false});
        const blurB=new T.WebGLRenderTarget(1,1,{type:targetType,depthBuffer:false});
        const postScene=new T.Scene(); const postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
        const vertexShader='varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
        const blurMaterial=new T.ShaderMaterial({depthTest:false,depthWrite:false,vertexShader,uniforms:{source:{value:null},stepSize:{value:new T.Vector2()},threshold:{value:0}},fragmentShader:`
            varying vec2 vUv; uniform sampler2D source; uniform vec2 stepSize; uniform float threshold;
            vec3 readColor(vec2 uv){vec3 c=texture2D(source,uv).rgb; float l=max(c.r,max(c.g,c.b));return c*max(l-threshold,0.)/max(l,.001);}
            void main(){vec3 c=readColor(vUv)*.227027;c+=readColor(vUv+stepSize*1.384615)*.316216;c+=readColor(vUv-stepSize*1.384615)*.316216;c+=readColor(vUv+stepSize*3.230769)*.070270;c+=readColor(vUv-stepSize*3.230769)*.070270;gl_FragColor=vec4(c,1.);}`});
        const compositeMaterial=new T.ShaderMaterial({depthTest:false,depthWrite:false,vertexShader,uniforms:{source:{value:sceneTarget.texture},bloom:{value:blurB.texture},intensity:{value:.6}},fragmentShader:`
            varying vec2 vUv; uniform sampler2D source; uniform sampler2D bloom; uniform float intensity;
            vec3 filmic(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
            void main(){vec3 c=texture2D(source,vUv).rgb+texture2D(bloom,vUv).rgb*intensity;
            c=filmic(c*.85); c=pow(c,vec3(1./2.2));
            float vignette=1.-.22*pow(length((vUv-.5)*vec2(1.,.7)),1.5); c*=vignette;
            float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);c+=(grain-.5)/255.;gl_FragColor=vec4(c,1.);}`});
        const quad=new T.Mesh(new T.PlaneGeometry(2,2),blurMaterial);postScene.add(quad);
        let renderWidth=1, renderHeight=1, quality=1;
        function resize() {
            const width=hero.clientWidth,height=hero.clientHeight;
            const ratio=Math.min(devicePixelRatio||1,1.4,Math.sqrt(2300000/(width*height)))*quality;
            renderWidth=Math.max(1,Math.round(width*ratio));renderHeight=Math.max(1,Math.round(height*ratio));
            renderer.setSize(renderWidth,renderHeight,false);
            sceneTarget.setSize(renderWidth,renderHeight);
            blurA.setSize(Math.max(1,Math.round(renderWidth/3)),Math.max(1,Math.round(renderHeight/3)));
            blurB.setSize(blurA.width,blurA.height);
            camera.aspect=width/height;camera.updateProjectionMatrix();
            assembly.position.x=camera.aspect*1.55;
        }
        function render() {
            renderer.setRenderTarget(sceneTarget);renderer.render(scene,camera);
            quad.material=blurMaterial;
            blurMaterial.uniforms.source.value=sceneTarget.texture;
            blurMaterial.uniforms.threshold.value=targetType===T.HalfFloatType?.8:.55;
            blurMaterial.uniforms.stepSize.value.set(1/renderWidth,0);
            renderer.setRenderTarget(blurA);renderer.render(postScene,postCamera);
            blurMaterial.uniforms.source.value=blurA.texture;blurMaterial.uniforms.threshold.value=0;
            blurMaterial.uniforms.stepSize.value.set(0,1/blurA.height);
            renderer.setRenderTarget(blurB);renderer.render(postScene,postCamera);
            blurMaterial.uniforms.source.value=blurB.texture;
            blurMaterial.uniforms.stepSize.value.set(1/blurA.width,0);
            renderer.setRenderTarget(blurA);renderer.render(postScene,postCamera);
            blurMaterial.uniforms.source.value=blurA.texture;
            blurMaterial.uniforms.stepSize.value.set(0,1/blurA.height);
            renderer.setRenderTarget(blurB);renderer.render(postScene,postCamera);
            quad.material=compositeMaterial;renderer.setRenderTarget(null);renderer.render(postScene,postCamera);
        }

        let frame=0,lastTime=0,elapsed=0,visible=true,userPaused=reducedMotion.matches,lost=false;
        let pointerX=0,pointerY=0,smoothedX=0,smoothedY=0,energy=0;
        let slowFrames=0,frameCount=0;
        const shouldRun=()=>visible&&!document.hidden&&!userPaused&&!lost&&document.getElementById('detailOverlay').hidden;
        function update(delta) {
            elapsed+=delta;
            const blend=1-Math.exp(-delta*3);
            smoothedX+=(pointerX-smoothedX)*blend;smoothedY+=(pointerY-smoothedY)*blend;
            energy+=(Math.max(0,1-Math.hypot(pointerX-.45,pointerY)*1.5)-energy)*blend;
            const scroll=Math.min(1,Math.max(0,window.scrollY/hero.clientHeight));
            camera.position.set(smoothedX*.28,1.4+smoothedY*.18,12-scroll*.65);
            camera.lookAt(0,.1,0);
            core.rotation.y=-.38+Math.sin(elapsed*.16)*.22+smoothedX*.09;
            core.rotation.z=-.12+Math.sin(elapsed*.12)*.035;
            core.position.y=Math.sin(elapsed*.7)*.08;
            keystone.rotation.y=Math.sin(elapsed*.25)*.2;
            halo.rotation.z=.23+elapsed*.035;
            tiltedRing.rotation.y=-.3+Math.sin(elapsed*.17)*.22;
            floating.forEach(part=>{part.mesh.position.y=part.y+Math.sin(elapsed*.55+part.phase)*part.amount;});
            innerFrames.forEach((part,i)=>{part.rotation.z=Math.sin(elapsed*.2-i*.22)*.035;});
            dust.rotation.y=elapsed*.009;dust.position.y=Math.sin(elapsed*.09)*.25;
            coreLight.intensity=5+Math.sin(elapsed*1.1)*.7+energy*2;
            compositeMaterial.uniforms.intensity.value=.45+energy*.12;
        }
        function tick(now) {
            frame=0;if(!shouldRun())return;
            const delta=lastTime?Math.min((now-lastTime)/1000,.05):1/60;
            if(lastTime&&now-lastTime>42)slowFrames++;
            lastTime=now;frameCount++;
            update(delta);render();
            if(frameCount===180&&slowFrames>80&&quality===1){quality=.72;resize();}
            frame=requestAnimationFrame(tick);
        }
        function sync() {
            if(frame)cancelAnimationFrame(frame);frame=0;lastTime=0;
            hero.dataset.sceneState=lost?'fallback':shouldRun()?'running':'paused';
            if(shouldRun())frame=requestAnimationFrame(tick);
        }
        function updateButton() {
            toggle.textContent=userPaused?'▷ 播放动效':'Ⅱ 暂停动效';
            toggle.setAttribute('aria-pressed',String(userPaused));
            toggle.setAttribute('aria-label',userPaused?'播放背景动画':'暂停背景动画');
        }
        hero.addEventListener('pointermove',event=>{
            if(userPaused)return;
            const rect=hero.getBoundingClientRect();
            pointerX=(event.clientX-rect.left)/rect.width*2-1;
            pointerY=-(event.clientY-rect.top)/rect.height*2+1;
        },{passive:true});
        hero.addEventListener('pointerleave',()=>{pointerX=pointerY=0;});
        toggle.addEventListener('click',()=>{userPaused=!userPaused;updateButton();sync();});
        reducedMotion.addEventListener('change',event=>{userPaused=event.matches;updateButton();sync();});
        document.addEventListener('visibilitychange',sync);
        new MutationObserver(sync).observe(document.getElementById('detailOverlay'),{attributes:true,attributeFilter:['hidden']});
        const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0});observer.observe(hero);
        let resizeTimer;
        window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(!lost){resize();update(0);render();}},120);},{passive:true});
        canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;sync();hero.classList.remove('scene-ready');toggle.hidden=true;});
        canvas.addEventListener('webglcontextrestored',()=>{
            try {
                environment.dispose();environment=createEnvironment();scene.environment=environment.texture;
                lost=false;resize();update(0);render();hero.classList.add('scene-ready');toggle.hidden=false;sync();
            } catch {lost=true;sync();}
        });
        window.addEventListener('pagehide',()=>{if(frame)cancelAnimationFrame(frame);frame=0;});
        window.addEventListener('pageshow',sync);
        resize();update(0);render();
        hero.classList.add('scene-ready');toggle.hidden=false;updateButton();sync();
    }
})();
