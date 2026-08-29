/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GoogleGenAI } from "@google/genai";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { TextPlugin } from 'gsap/TextPlugin';

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, TextPlugin);
    
    // --- Preloader ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        const preloaderLogo = document.querySelector('.preloader-logo');
        if (preloaderLogo) {
            gsap.fromTo(preloaderLogo, 
                { scale: 0.8, opacity: 0 }, 
                { scale: 1, opacity: 1, duration: 1, ease: 'power2.out', delay: 0.2 }
            );
        }
    
        window.addEventListener('load', () => {
            gsap.to(preloader, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => preloader.classList.add('hidden')
            });
            
            // --- Page Load Animation ---
            const header = document.querySelector('header');
            if(header) {
                gsap.from(header, {
                    y: -50,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    delay: 0.3
                });
            }
            
            gsap.to('.cursor, .cursor-outline', {
                opacity: 1,
                duration: 1,
                delay: 0.8,
                ease: 'power3.out'
            });

            // Specific hero title animation
            const heroTitle = document.querySelector('#hero .animated-title');
            if (heroTitle) {
                gsap.from(heroTitle, {
                    y: '100%',
                    opacity: 0,
                    duration: 1.2,
                    ease: 'power4.out',
                    delay: 0.4, 
                });
            }
        });
    }


    // --- Gemini AI Chat Assistant ---
    const chatButton = document.getElementById('ai-chat-button');
    const chatModal = document.getElementById('ai-chat-modal');
    const chatForm = document.getElementById('ai-chat-form');
    
    if (chatButton && chatModal && chatForm) {
        const chatClose = document.getElementById('ai-chat-close');
        const chatBackdrop = document.getElementById('ai-chat-backdrop');
        const chatInput = document.getElementById('ai-chat-input');
        const chatMessages = document.getElementById('ai-chat-messages');
        const chatSubmitButton = chatForm.querySelector('button[type="submit"]');

        let chat;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are Anjali Yadav, an AI assistant for Anjali Yadav, a creative developer. You are friendly, witty, and knowledgeable about her skills, projects, and experience. Your goal is to answer questions from potential recruiters or clients in a way that highlights Anjali's strengths.

Keep your answers concise, engaging, and professional, but with a creative flair. Use the information below, but don't just copy-paste it. Rephrase it in a conversational way.

**About Anjali Yadav:**
- A creative developer with over 2+ years of experience.
- Passionate about merging logic and creativity, building technically robust, performant, aesthetically pleasing, and intuitive digital experiences.
- Specializes in front-end interfaces and interactive 3D scenes.

**Core Skills:**
- **3D & Graphics:** Three.js
- **Frontend Frameworks:** React, Javascript
- **Animation:** GSAP
- **Web Technologies:** Node.js
- **Design Tools:** Canva

**Featured Projects:**
1.  **3D Product Configurator:**
    - **Challenge:** High-performance 3D configurator for complex models with real-time material customization.
    - **Solution:** Used a custom WebGL renderer, Draco compression, and smart texture loading for a smooth 60fps experience.
    - **Technologies:** Three.js, React, GSAP.
2.  **Generative Art Platform:**
    - **Challenge:** Allow users to create unique art with simple controls.
    - **Solution:** Developed modular algorithms (Perlin noise, etc.) and a real-time preview system. Increased user engagement by 300%.
    - **Technologies:** p5.js, Vue.js, Firebase.
3.  **VR Data Visualization:**
    - **Challenge:** Visualize complex datasets in VR for both desktop and mobile.
    - **Solution:** Created a hybrid interaction model (gaze + controller) and an adaptive spatial UI.
    - **Technologies:** A-Frame, WebXR, D3.js.
4.  **Interactive Music Experience:**
    - **Challenge:** Synchronize complex audio visualizations with music perfectly.
    - **Solution:** Built a custom audio analysis pipeline with the Web Audio API and a high-performance canvas renderer.
    - **Technologies:** Web Audio API, Canvas, GSAP.
5.  **Architectural Walkthrough:**
    - **Challenge:** Render detailed architectural models with realistic lighting in-browser.
    - **Solution:** Optimized models, baked lighting, and implemented a custom Level of Detail (LOD) system with PBR materials.
    - **Technologies:** Three.js, Blender, GLTF.

If you don't know the answer, politely say that it's beyond your knowledge but you can pass the message to John. Do not make up information.`;

            chat = ai.chats.create({
              model: 'gemini-2.5-flash',
              config: {
                  systemInstruction: systemInstruction,
              },
            });

            chatButton.addEventListener('click', openChat);
            chatClose?.addEventListener('click', closeChat);
            chatBackdrop?.addEventListener('click', closeChat);
            chatForm.addEventListener('submit', handleChatSubmit);

            addBotMessage("Hello! I'm JD, John's AI assistant. Feel free to ask me anything about his work or skills!");

        } catch (error) {
            console.error("Failed to initialize Gemini AI:", error);
            chatButton.style.display = 'none'; // Hide button if AI fails
        }
        
        function openChat() {
            chatModal.classList.remove('hidden');
            chatModal.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }

        function closeChat() {
            chatModal.classList.remove('visible');
            setTimeout(() => {
                chatModal.classList.add('hidden');
                document.body.style.overflow = '';
            }, 300); // Match transition duration
        }

        function scrollChatToBottom() {
            if (!chatMessages) return;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function setFormState(isLoading) {
            if (!chatInput || !chatSubmitButton) return;
            chatInput.disabled = isLoading;
            chatSubmitButton.disabled = isLoading;
        }

        function addUserMessage(message) {
            if (!chatMessages) return;
            chatMessages.innerHTML += `
                <div class="chat-message user">
                    <div class="message-content">${message}</div>
                    <div class="avatar bg-indigo-600 text-white flex items-center justify-center font-bold">You</div>
                </div>`;
            scrollChatToBottom();
        }

        function addBotMessage(message, isStreaming = false) {
            if (!chatMessages) return null;
            const botMessageId = `bot-message-${Date.now()}`;
            chatMessages.innerHTML += `
                <div class="chat-message ai">
                    <div class="avatar bg-slate-700 flex items-center justify-center">
                        <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707.707"></path></svg>
                    </div>
                    <div class="message-content" id="${botMessageId}">${isStreaming ? '' : message}</div>
                </div>`;
            scrollChatToBottom();
            return document.getElementById(botMessageId);
        }
        
        function addTypingIndicator() {
            if (!chatMessages) return;
            chatMessages.innerHTML += `
                <div class="chat-message ai typing-indicator">
                     <div class="avatar bg-slate-700 flex items-center justify-center">
                         <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707.707"></path></svg>
                     </div>
                     <div class="message-content">
                        <span class="mr-1"></span><span></span><span class="ml-1"></span>
                     </div>
                </div>`;
            scrollChatToBottom();
        }

        function removeTypingIndicator() {
            const indicator = document.querySelector('.typing-indicator');
            if (indicator) {
                indicator.remove();
            }
        }

        async function handleChatSubmit(e) {
            e.preventDefault();
            if (!chatInput) return;
            const message = chatInput.value.trim();
            if (!message) return;

            addUserMessage(message);
            chatInput.value = '';
            setFormState(true);
            addTypingIndicator();

            try {
                const stream = await chat.sendMessageStream({ message });
                removeTypingIndicator();
                const botMessageElement = addBotMessage('', true);
                let responseText = '';
                
                if (botMessageElement) {
                    for await (const chunk of stream) {
                        responseText += chunk.text;
                        botMessageElement.innerHTML = responseText.replace(/\n/g, '<br>'); // Basic markdown
                        scrollChatToBottom();
                    }
                }

            } catch (error) {
                console.error("Gemini API error:", error);
                removeTypingIndicator();
                addBotMessage("Sorry, I'm having trouble connecting right now. Please try again later.");
            } finally {
                setFormState(false);
                chatInput.focus();
            }
        }
    }


    // --- 3D Background Scene ---
    const canvas = document.querySelector('.webgl-canvas');
    if (canvas) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
        const renderer = new THREE.WebGLRenderer({ 
            canvas, 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const bloomParams = {
            exposure: 1,
            bloomStrength: 0.5,
            bloomThreshold: 0,
            bloomRadius: 0.5
        };
        
        const renderScene = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            bloomParams.bloomStrength,
            bloomParams.bloomRadius,
            bloomParams.bloomThreshold
        );
        
        const composer = new EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);

        const objectsGroup = new THREE.Group();
        scene.add(objectsGroup);

        const geometries = [
            new THREE.IcosahedronGeometry(1, 1),
            new THREE.OctahedronGeometry(1, 1),
            new THREE.TorusKnotGeometry(0.8, 0.3, 100, 16),
            new THREE.DodecahedronGeometry(1, 0),
            new THREE.TorusGeometry(0.8, 0.3, 16, 32)
        ];

        const baseColor = new THREE.Color('#818cf8');
        const materials = [
            new THREE.MeshBasicMaterial({ color: baseColor, wireframe: true }),
            new THREE.MeshBasicMaterial({ color: baseColor, wireframe: true, transparent: true, opacity: 0.7 }),
            new THREE.PointsMaterial({ color: baseColor, size: 0.02 })
        ];

        let ySpreadFactor = document.body.scrollHeight / window.innerHeight;
        if (!isFinite(ySpreadFactor) || ySpreadFactor < 1) {
            ySpreadFactor = 3; 
        }

        for (let i = 0; i < 80; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = materials[Math.floor(Math.random() * materials.length)].clone();
            
            let object;
            if (material instanceof THREE.PointsMaterial) {
                object = new THREE.Points(geometry, material);
            } else {
                object = new THREE.Mesh(geometry, material);
            }
            
            object.position.x = (Math.random() - 0.5) * 20;
            object.position.y = -(Math.random() * (ySpreadFactor * 8));
            object.position.z = (Math.random() - 0.5) * 20;
            object.rotation.x = Math.random() * Math.PI;
            object.rotation.y = Math.random() * Math.PI;
            
            object.userData = {
                speed: Math.random() * 0.002 + 0.001,
                rotationSpeed: Math.random() * 0.01 + 0.005,
                amplitude: Math.random() * 0.5 + 0.1,
                frequency: Math.random() * 0.01 + 0.005
            };
            
            objectsGroup.add(object);
        }

        const particleCount = 500;
        const particles = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleSizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            particlePositions[i * 3] = (Math.random() - 0.5) * 50;
            particlePositions[i * 3 + 1] = -(Math.random() * (ySpreadFactor * 10));
            particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
            particleSizes[i] = Math.random() * 0.1 + 0.05;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: baseColor,
            size: 0.1,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        scene.add(particleSystem);
        
        // --- Dynamic Scene Color Change on Scroll ---
        const colorThemes = {
            default: new THREE.Color('#818cf8'),
            about: new THREE.Color('#a78bfa'),
            skills: new THREE.Color('#7dd3fc'),
            projects: new THREE.Color('#f472b6'),
            contact: new THREE.Color('#f59e0b'),
        };

        const allMaterials = [particleMaterial, ...objectsGroup.children.map(c => c.material)];

        const changeSceneColor = (color) => {
            allMaterials.forEach(material => {
                // All materials in the scene (MeshBasicMaterial, PointsMaterial) have a `color` property.
                if (material) {
                     gsap.to(material.color, {
                        r: color.r,
                        g: color.g,
                        b: color.b,
                        duration: 1.5,
                        ease: 'sine.inOut'
                    });
                }
            });
        };

        ScrollTrigger.create({ trigger: '#hero', start: 'top center', end: 'bottom center', onToggle: self => self.isActive && changeSceneColor(colorThemes.default) });
        ScrollTrigger.create({ trigger: '#about', start: 'top center', end: 'bottom center', onToggle: self => self.isActive && changeSceneColor(colorThemes.about) });
        ScrollTrigger.create({ trigger: '#skills', start: 'top center', end: 'bottom center', onToggle: self => self.isActive && changeSceneColor(colorThemes.skills) });
        ScrollTrigger.create({ trigger: '#projects', start: 'top center', end: 'bottom center', onToggle: self => self.isActive && changeSceneColor(colorThemes.projects) });
        ScrollTrigger.create({ trigger: '#contact', start: 'top center', end: 'bottom center', onToggle: self => self.isActive && changeSceneColor(colorThemes.contact) });

        const clock = new THREE.Clock();
        const animate = () => {
            const elapsedTime = clock.getElapsedTime();
            
            objectsGroup.children.forEach(obj => {
                obj.rotation.x += obj.userData.rotationSpeed;
                obj.rotation.y += obj.userData.rotationSpeed * 0.7;
                obj.position.y += Math.sin(elapsedTime * obj.userData.frequency) * obj.userData.amplitude * 0.01;
            });
            
            particleSystem.rotation.y += 0.0005;
            
            composer.render();
            window.requestAnimationFrame(animate);
        };
        animate();

        window.addEventListener('scroll', () => {
            camera.position.y = -window.scrollY / window.innerHeight * 3;
        });
        
        const cursor = { x: 0, y: 0 };
        window.addEventListener('mousemove', (event) => {
            cursor.x = event.clientX / window.innerWidth - 0.5;
            cursor.y = event.clientY / window.innerHeight - 0.5;
            gsap.to(objectsGroup.rotation, {
                y: -cursor.x * 0.5,
                x: cursor.y * 0.5,
                duration: 1,
                ease: 'power2.out'
            });
        });

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            composer.setSize(window.innerWidth, window.innerHeight);
             let newYSpreadFactor = document.body.scrollHeight / window.innerHeight;
            if (isFinite(newYSpreadFactor) && newYSpreadFactor >= 1) {
                ySpreadFactor = newYSpreadFactor;
            }
        });
    }

    // --- Custom Cursor & Light Flare---
    const cursorDot = document.querySelector('.cursor');
    const cursorOutline = document.querySelector('.cursor-outline');
    const lightFlare = document.querySelector('.cursor-light-flare');

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            gsap.to(cursorDot, { x: clientX, y: clientY, duration: 0.2, ease: 'power2.out' });
            gsap.to(cursorOutline, { x: clientX, y: clientY, duration: 0.4, ease: 'power2.out' });
            if (lightFlare) {
                gsap.to(lightFlare, { x: clientX, y: clientY, duration: 0.6, ease: 'power2.out' });
            }
        });
        
        document.querySelectorAll('a, button, .project-card').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.classList.add('cursor-active');
                cursorDot.classList.add('cursor-click');
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.classList.remove('cursor-active');
                cursorDot.classList.remove('cursor-click');
            });
        });
    }
    
    document.querySelectorAll('.magnetic-link').forEach((button) => {
        const htmlButton = button;
        htmlButton.addEventListener('mousemove', (e) => {
            const rect = htmlButton.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const distanceX = x - centerX;
            const distanceY = y - centerY;
            gsap.to(htmlButton, {
                x: distanceX * 0.2,
                y: distanceY * 0.2,
                duration: 0.3
            });
        });
        
        htmlButton.addEventListener('mouseleave', () => {
            gsap.to(htmlButton, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        });
    });

    // --- Advanced Text Animations ---
    function splitTextIntoSpans(selector) {
        document.querySelectorAll(selector).forEach((element) => {
            const htmlElement = element;
            const text = htmlElement.textContent;
            if (!text) return;
            htmlElement.innerHTML = '';
            const words = text.split(' ');
            words.forEach((word, i) => {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'line-wrap';
                const chars = word.split('');
                chars.forEach(char => {
                    const charSpan = document.createElement('span');
                    charSpan.className = 'char';
                    charSpan.textContent = char;
                    wordSpan.appendChild(charSpan);
                });
                if (i < words.length - 1) {
                    const spaceSpan = document.createElement('span');
                    spaceSpan.className = 'char';
                    spaceSpan.textContent = '\u00A0';
                    wordSpan.appendChild(spaceSpan);
                }
                htmlElement.appendChild(wordSpan);
            });
        });
    }
    
    // Animate non-hero titles on scroll
    gsap.utils.toArray('section:not(#hero) .animated-title').forEach((title) => {
        gsap.from(title, {
            y: '100%',
            opacity: 0,
            duration: 0.8,
            ease: 'back.out(1.7)',
            scrollTrigger: {
                trigger: title,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });
    
    gsap.utils.toArray('.animated-subtitle').forEach((subtitle) => {
        gsap.from(subtitle, {
            opacity: 0,
            y: 20,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: subtitle,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    // --- Horizontal Scroll for Projects ---
    const projectsWrapper = document.getElementById('projects-wrapper');
    const projectsContainer = document.getElementById('projects-container');
    if (projectsWrapper && projectsContainer) {
        gsap.to(projectsWrapper, {
            x: () => -(projectsWrapper.scrollWidth - projectsContainer.clientWidth) + "px",
            ease: "none",
            scrollTrigger: {
                trigger: projectsContainer,
                start: "top top",
                end: () => "+=" + (projectsWrapper.scrollWidth - projectsContainer.clientWidth),
                scrub: true,
                pin: true,
                invalidateOnRefresh: true,
            }
        });

        // --- Project Card Tilt Effect ---
        const projectCards = document.querySelectorAll('#projects-wrapper .project-card');
        projectCards.forEach((card) => {
            const htmlCard = card;
            htmlCard.addEventListener('mousemove', (e) => {
                const rect = htmlCard.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rotateY = gsap.utils.mapRange(0, rect.width, -15, 15, x);
                const rotateX = gsap.utils.mapRange(0, rect.height, 15, -15, y);
                
                gsap.to(htmlCard, {
                    rotationY: rotateY * 0.5,
                    rotationX: rotateX * 0.5,
                    transformPerspective: 1000,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            });
            
            htmlCard.addEventListener('mouseleave', () => {
                gsap.to(htmlCard, {
                    rotationY: 0,
                    rotationX: 0,
                    duration: 0.8,
                    ease: 'elastic.out(1, 0.5)'
                });
            });
        });
    }
    
    // --- Scroll Indicator ---
    const sections = document.querySelectorAll('section');
    const scrollDots = document.querySelectorAll('.scroll-dot');
    if (sections.length > 0 && scrollDots.length > 0) {
        sections.forEach((section, index) => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                onToggle: self => {
                    if(self.isActive) {
                        scrollDots.forEach(dot => dot.classList.remove('active'));
                        if (scrollDots[index]) {
                            scrollDots[index].classList.add('active');
                        }
                    }
                }
            });
        });
        
        scrollDots.forEach((dot) => {
            const htmlDot = dot;
            htmlDot.addEventListener('click', () => {
                if (htmlDot.dataset.section) {
                    const section = document.getElementById(htmlDot.dataset.section);
                    if (section) {
                        gsap.to(window, {
                            scrollTo: section,
                            duration: 1,
                            ease: 'power3.out'
                        });
                    }
                }
            });
        });
    }

    // --- Dynamic Content Injection ---
    // Skills
    const skillsContainer = document.querySelector('#skills .grid');
    if (skillsContainer) {
        const skills = [
            { name: 'OS', icon: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M1.333 8l10.667-4l10.667 4v8l-10.667 4l-10.667-4V8zm1.334 0v6.667l9.333 3.333l9.333-3.333V8l-9.333-3.333L2.667 8z"/></svg>` },
            { name: 'React', icon: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm-4.5-8.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5zm4.5 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5zm4.5 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5z"/></svg>` },
            { name: 'DBMS', icon: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C7.58 2 4 3.79 4 6v12c0 2.21 3.58 4 8 4s8-1.79 8-4V6c0-2.21-3.58-4-8-4zm0 2c3.31 0 6 .9 6 2s-2.69 2-6 2-6-.9-6-2 2.69-2 6-2zm-6 5.02C7.46 10.27 9.65 10.5 12 10.5s4.54-.23 6-1.48V12c0 1.1-2.69 2-6 2s-6-.9-6-2V9.02zm0 5C7.46 15.27 9.65 15.5 12 15.5s4.54-.23 6-1.48V17c0 1.1-2.69 2-6 2s-6-.9-6-2v-2.98z"/></svg>` },
            { name: 'Node.js', icon: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>` },
            { name: 'Javascript', icon: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>` },
            { name: 'C++', icon: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm1-13h2v6h-2zm0 8h2v2h-2z"/></svg>` },
            { name: 'html/css', icon: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>` },
            { name: 'sql', icon: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm1-13h2v6h-2zm0 8h2v2h-2z"/></svg>` },
        ];
        
        skillsContainer.innerHTML = skills.map((skill) => `
            <div class="skill-card p-8 rounded-xl text-center transition-all duration-300">
                <div class="relative">
                    <div class="h-16 w-16 mx-auto mb-4 text-indigo-400">${skill.icon}</div>
                    <h3 class="font-semibold text-white text-lg">${skill.name}</h3>
                </div>
            </div>
        `).join('');

        gsap.utils.toArray('.skill-card').forEach((card, i) => {
            gsap.from(card, {
                opacity: 0,
                y: 50,
                duration: 0.5,
                delay: i * 0.1,
                ease: 'back.out(1.7)',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                }
            });
        });
    }
    
    // Projects
    const projects = [
        { 
            id: 1, 
            title: 'Idea Orbit', 
            img: 'https://placehold.co/600x400/111827/7dd3fc?text=Idea+Orbit', 
            tags: ["React", "Node.js", "MongoDB"], 
            description: "Idea Orbit is a modern platform for sharing ideas, connecting people, and turning thoughtful concepts into meaningful conversations.",
            link: "#"
        },
        {
            id: 2,
            title: 'Sanvidhan',
            img: 'https://placehold.co/600x400/111827/fbbf24?text=Sanvidhan',
            tags: ["React", "JavaScript", "CSS"],
            description: "Sanvidhan is an interactive project designed to make constitutional knowledge easier to explore and understand.",
            link: "#"
        },
        {
            id: 3,
            title: 'Todo List',
            img: 'https://placehold.co/600x400/111827/34d399?text=Todo+List',
            tags: ["JavaScript", "HTML", "CSS"],
            description: "A clean and practical todo list application for organizing tasks, tracking progress, and staying productive.",
            link: "#"
        },
        {
            id: 4,
            title: 'Calculator',
            img: 'https://placehold.co/600x400/111827/f472b6?text=Calculator',
            tags: ["JavaScript", "HTML", "CSS"],
            description: "A responsive calculator with a simple interface for performing everyday arithmetic operations quickly and accurately.",
            link: "#"
        }
    ];
    
    if (projectsWrapper) {
        projectsWrapper.innerHTML = projects.map(p => `
            <div class="project-card rounded-xl overflow-hidden group" data-project-id="${p.id}">
                <div class="project-image-container relative">
                    <img src="${p.img}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${p.title}">
                    <div class="project-image-overlay"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    </div>
                </div>
                <div class="p-6 flex-grow flex flex-col">
                    <h3 class="text-xl font-bold text-white mb-2">${p.title}</h3>
                    <button class="mt-auto font-semibold text-indigo-400 hover:text-indigo-300 transition magnetic-link project-details-button flex items-center gap-2 w-fit">
                        <span>View Details</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Project Modal
    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close');
    
    if (modal && modalClose) {
        const closeModal = () => {
            const modalTransform = modal.querySelector('.transform');
            if (!modalTransform) return;
            gsap.to(modalTransform, {
                opacity: 0, scale: 0.95, y: 20, duration: 0.3, ease: 'power2.in',
                onComplete: () => {
                    modal.classList.add('hidden');
                    document.body.style.overflow = 'auto';
                }
            });
        };

        document.querySelectorAll('.project-details-button').forEach(button => {
            button.addEventListener('click', () => {
                const projectCard = button.closest('.project-card');
                if (projectCard && projectCard.dataset.projectId) {
                    const projectId = parseInt(projectCard.dataset.projectId, 10);
                    const project = projects.find(p => p.id === projectId);
                    
                    if (project) {
                        const modalImage = document.getElementById('modal-image');
                        if (modalImage) {
                            modalImage.src = project.img;
                            modalImage.alt = project.title;
                        }
                        
                        const modalTitle = document.getElementById('modal-title');
                        if (modalTitle) modalTitle.textContent = project.title;

                        const modalDescription = document.getElementById('modal-description');
                        if (modalDescription) modalDescription.textContent = project.description;

                        const modalLink = document.getElementById('modal-link');
                        if(modalLink) modalLink.href = project.link;
                        
                        modal.classList.remove('hidden');
                        document.body.style.overflow = 'hidden';

                        const modalTransform = modal.querySelector('.transform');
                        if(modalTransform) {
                            gsap.fromTo(modalTransform, 
                                { opacity: 0, scale: 0.95, y: 20 },
                                { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' }
                            );
                        }
                    }
                }
            });
        });
        
        modalClose.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Contact Form Interactivity
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitButton = document.getElementById('contact-submit-button');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.querySelector('span').textContent = 'Sending...';
                
                // Simulate network request
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.querySelector('span').textContent = 'Send Message';
                    // Here you would add success/error handling
                }, 2000);
            }
        });
    }

    // --- Mobile Menu ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.innerHTML = `
                    <a href="#about" class="block py-2 text-slate-300 hover:text-white transition">About</a>
                    <a href="#skills" class="block py-2 text-slate-300 hover:text-white transition">Skills</a>
                    <a href="#projects" class="block py-2 text-slate-300 hover:text-white transition">Projects</a>
                    <a href="#contact" class="block py-2 px-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition w-fit">Contact</a>
                `;
            }
        });
    }

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (!targetId) return;

            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                gsap.to(window, {
                    scrollTo: {
                        y: targetElement,
                        offsetY: 80
                    },
                    duration: 1,
                    ease: 'power3.out'
                });
                
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });
});
