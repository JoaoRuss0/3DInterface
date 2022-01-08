var cena = new THREE.Scene()
var camara = new THREE.PerspectiveCamera(70, 680 / 680, 0.1, 500)
var meuCanvas = document.getElementById('meuCanvas')
var renderer = new THREE.WebGLRenderer({ canvas: meuCanvas })
var controlos = new THREE.OrbitControls(camara, renderer.domElement)
var carregador = new THREE.GLTFLoader()
var animationMixer = new THREE.AnimationMixer(cena)
var loader = new THREE.TextureLoader()
var raycaster = new THREE.Raycaster()
var rato = new THREE.Vector2()
var clipes = []
var acoes = []
var objectsToHide = []
var materials = []
var candidatos = []
var objetosParaMudarTexturas = []
var materialSelectionado

var clock = new THREE.Clock()
clock.stop()

function pegarPrimeiro() {
    raycaster.setFromCamera(rato, camara)
   
    var intersetados = raycaster.intersectObjects(candidatos)

    if (intersetados.length > 0)
    {
        for (var i = 0; i < objetosParaMudarTexturas.length; i++) {
            objetosParaMudarTexturas[i].material = materialSelectionado 
        }
    }
}

renderer.setSize(680, 680)
renderer.shadowMap.enabled = true
renderer.render(cena, camara)

camara.position.x = 0
camara.position.z = 40
camara.position.y = 25
camara.lookAt(0, 0, 0)

carregador.load(
    'cena.gltf',
    function (gltf) {
        cena.add(gltf.scene)

        cena.traverse(function (elemento) {
            if (elemento.isMesh) {
                elemento.castShadow = true
                elemento.receiveShadow = true
            }

            if(elemento.name.includes("door") || elemento.name.includes("Extend") || elemento.name == "workBench") {
                candidatos.push(elemento)
                objetosParaMudarTexturas.push(elemento)
            }

            if(elemento.name.includes("workBench")) {
                materials.push(elemento.material)
                materialSelectionado = materials[0]
            }
        });
        
        texture = loader.load( './plywood.jpg' );
        materials.push(new THREE.MeshBasicMaterial( { map: texture } ))
        texture = loader.load( './Wood051.png' );
        materials.push(new THREE.MeshBasicMaterial( { map: texture } ))

        for (var i = 1; i <= 13; i++)
            objectsToHide.push(cena.getObjectByName("Bloco" + i))
        for (var i = 1; i <= 4; i++)
            objectsToHide.push(cena.getObjectByName("Poste" + i))
        objectsToHide.push(cena.getObjectByName("Parede"))
        objectsToHide.push(cena.getObjectByName("Terra"))
        objectsToHide.push(cena.getObjectByName("Chao"))
        objectsToHide.push(cena.getObjectByName("Tabua1"))
        objectsToHide.push(cena.getObjectByName("Tabua2"))
        
        clipes.push(THREE.AnimationClip.findByName( gltf.animations, 'benchExtendAction' ))
        acoes.push(animationMixer.clipAction(clipes[0]))
        clipes.push(THREE.AnimationClip.findByName( gltf.animations, 'doorAction' ))
        acoes.push(animationMixer.clipAction(clipes[1]))
        clipes.push(THREE.AnimationClip.findByName( gltf.animations, 'door1Action.001' ))
        acoes.push(animationMixer.clipAction(clipes[2]))
        clipes.push(THREE.AnimationClip.findByName( gltf.animations, 'legExtend1Action' ))
        acoes.push(animationMixer.clipAction(clipes[3]))

        acoes[0].play()
        acoes[1].play()
        acoes[2].play()
        acoes[3].play()
    }
)

window.onclick = function(evento) {
    const rect = renderer.domElement.getBoundingClientRect();
    rato.x = ( ( evento.clientX - rect.left ) / ( rect. right - rect.left ) ) * 2 - 1;
    rato.y = - ( ( evento.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
    // invocar raycaster
    pegarPrimeiro()
}

var ambientLight = new THREE.AmbientLight("white", 1.5)
cena.add(ambientLight)

var btn_play = document.getElementById("btn_play")
var btn_pause = document.getElementById("btn_pause")
var btn_stop = document.getElementById("btn_stop")
var menu_loop = document.getElementById("menu_loop")
var btn_hide = document.getElementById("btn_hide")
var btn_repor = document.getElementById("btn_repor")

var wood1 = document.getElementById("wood1")
var wood2 = document.getElementById("wood2")
var wood3 = document.getElementById("wood3")

btn_play.addEventListener("click", () => {
    clock.start()
})

btn_pause.addEventListener("click", () => {
    clock.stop()
})

btn_stop.addEventListener("click", () => {
    clock.stop()

    acoes.forEach(acao => {
        acao.reset()
    });

    animationMixer.timeScale = 1
})

btn_hide.addEventListener("click", () => {
    clock.stop()

    acoes.forEach(acao => {
        acao.reset()
    });

    for (var i = 0; i < objectsToHide.length; i++) {
        objectsToHide[i].visible = !objectsToHide[i].visible
    }

    if(objectsToHide[0].visible){
        btn_hide.innerText = "Mostrar só mesa"
    }
    else{
        btn_hide.innerText = "Mostrar tudo"
    }

})

menu_loop.addEventListener("change", () => {
    clock.stop()

    let clamp, loop
    
    switch (menu_loop.value) {
        case "1":
            clamp = true
            loop = THREE.LoopOnce
            break;
        case "2":
            clamp = false
            loop = THREE.LoopRepeat
            break;
        case "3":
            clamp = false
            loop = THREE.LoopPingPong
            break;
    }

    acoes.forEach((acao) => {
        acao.setLoop(loop)
        acao.clampWhenFinished = clamp
    });

    acoes.forEach(acao => {
        acao.reset()
    });
})

wood1.addEventListener("click", () => {
    materialSelectionado = materials[1]
})

wood2.addEventListener("click", () => {
    materialSelectionado = materials[0]

})

wood3.addEventListener("click", () => {
    materialSelectionado = materials[2]
})

btn_repor.addEventListener("click", () => {
    for (var i = 0; i < objetosParaMudarTexturas.length; i++) {
        objetosParaMudarTexturas[i].material = materials[0] 
    }
})

function animar() {
    requestAnimationFrame(animar)
    renderer.render(cena, camara)
    animationMixer.update( clock.getDelta() )
    
}
animar()