var cena = new THREE.Scene()
var camara = new THREE.PerspectiveCamera(70, 680 / 680, 0.1, 500)
var meuCanvas = document.getElementById('meuCanvas')
var renderer = new THREE.WebGLRenderer({ canvas: meuCanvas })
var controlos = new THREE.OrbitControls(camara, renderer.domElement)
var carregador = new THREE.GLTFLoader()
var animationMixer = new THREE.AnimationMixer(cena)
var clipes = []
var acoes = []

var eixos = new THREE.AxesHelper()
cena.add(eixos)
var grelha = new THREE.GridHelper()
cena.add(grelha)
var clock = new THREE.Clock()
clock.stop()

renderer.setSize(680, 680)
renderer.shadowMap.enabled = true
renderer.render(cena, camara)

camara.position.x = 6
camara.position.y = 4
camara.position.z = 7
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
        });

        clipes.push(THREE.AnimationClip.findByName( gltf.animations, 'LocY' ))
        acoes.push(animationMixer.clipAction(clipes[0]))
        clipes.push(THREE.AnimationClip.findByName( gltf.animations, 'LocZ' ))
        acoes.push(animationMixer.clipAction(clipes[1]))
        clipes.push(THREE.AnimationClip.findByName( gltf.animations, 'RotZ' ))
        acoes.push(animationMixer.clipAction(clipes[2]))

        acoes[0].play()
        acoes[1].play()
        acoes[2].play()
    }
)

var luzPonto1 = new THREE.PointLight("white")
luzPonto1.position.set(5, 3, 5)
luzPonto1.castShadow = true
cena.add(luzPonto1)

var btn_play = document.getElementById("btn_play")
var btn_pause = document.getElementById("btn_pause")
var btn_stop = document.getElementById("btn_stop")
var btn_reverse = document.getElementById("btn_reverse")
var menu_loop = document.getElementById("menu_loop")

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

btn_reverse.addEventListener("click", () => {
    animationMixer.timeScale = -(animationMixer.timeScale)
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
    
    clock.start()
})

function animar() {
    requestAnimationFrame(animar)
    renderer.render(cena, camara)
    animationMixer.update( clock.getDelta() )
}
animar()