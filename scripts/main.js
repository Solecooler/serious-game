// Définir les limites de la partie centrale
const gameWidth = window.innerWidth; // Largeur de la fenetre
const gameHeight = window.innerHeight; // hauteur de la fenetre
const centralWidth = gameWidth * 0.6; // 60% de la largeur de l'écran
const centralHeight = gameHeight; // 60% de la hauteur de l'écran
const centralLeft = (gameWidth - centralWidth) / 7.25; // Zone de déplacement en X
const centralRight = centralLeft + centralWidth;
const centralTop = 0;
const centralBottom = gameHeight;



let score = 0;
let baseSpeed = 1; // Vitesse de base des objets
let currentSpeed = baseSpeed;
let speedMultiplier = 1.2; // Facteur d'augmentation de la vitesse
let temperature = 0;
let environment = 'chantier';
let gameLoopId;
const character = document.getElementById('character');
const scoreDisplay = document.getElementById('score');
const temperatureDisplay = document.getElementById('temperature');
const gameContainer = document.getElementById('gameContainer');

// Dictionnaire contenant les source et caracteristiques des objets :
const assets = {
    semelle: {
        imageSrc: 'assets/images/semelle_rouge.png',
        width: 45,
        height: 60,
        className: 'semelle'
    },
    panneau_inflammable: {
        imageSrc: 'assets/images/panneau_inflammable.png',
        width: 50,
        height: 50,
        className: 'panneau_inflammable'
    },
    pelle: {
        imageSrc: 'assets/images/pelle.png',
        width: 50,
        height: 50,
        className: 'pelle'
    },
    marteau: {
        imageSrc: 'assets/images/marteau.png',
        width: 50,
        height: 50,
        className: 'marteau'
    },
    panneau_verglas: {
        imageSrc: 'assets/images/panneau_verglas.png',
        width: 50,
        height: 50,
        className: 'panneau_verglas'
    },
    flaque: {
        imageSrc: 'assets/images/flaque_eau.png',
        width: 50,
        height: 50,
        className: 'flaque'
    }
};


// Position initial du personnage (PNJ)
let characterPosition = centralLeft + (centralWidth / 2) - (character.clientWidth / 2);

// Déplacement et gestion des objets
function moveObjects() {
    const objects = document.querySelectorAll('.game-object');
    objects.forEach(obj => {
        let currentTop = parseFloat(obj.style.top);
        let speed = parseFloat(obj.dataset.speed);
        obj.style.top = `${currentTop + speed}px`;  // Ralentit la descente des objets

        // Vérification de la collision avec le personnage
        if (isColliding(obj, character)) {
            if (obj.classList.contains('semelle')) {
                // Ramasser une semelle
                temperature -= 10; // Baisse la température
                if (temperature < 0) temperature = 0;
                obj.remove(); // Supprime l'objet après collecte
            } else {
                // Collision avec un obstacle
                temperature += 10; // Augmente la température plus lentement
                obj.remove(); // Supprime l'objet après collision
            }
        }
        // Vérifier si l'objet dépasse la limite de la route
        const objectLeft = parseFloat(obj.style.left);

        

        // Supprimer l'objet s'il sort de la partie centrale de l'écran
        if (currentTop > centralBottom) {
            obj.remove();
        }
    });
}

// Vérification de la collision entre deux éléments
function isColliding(a, b) {
    const rect1 = a.getBoundingClientRect();
    const rect2 = b.getBoundingClientRect();

    return !(rect1.right < rect2.left ||
             rect1.left > rect2.right ||
             rect1.bottom < rect2.top ||
             rect1.top > rect2.bottom);
}

// Gestion du score :
function increaseScore() {
    score++;
    scoreDisplay.innerText = `Score: ${score}`;
    // Vérifier si le score a atteint un nouveau palier de 500 points
    if (score % 500 === 0) {
        increaseSpeed();
    }
}
// Emplification de la vitesse : 
function increaseSpeed() {
    currentSpeed *= speedMultiplier;
    console.log(`Vitesse augmentée à ${currentSpeed}`);
    updateObjectsSpeeds();
}
// Fonction : mettent à jour la vitesse des objets : 
function updateObjectsSpeeds() {
    const objects = document.querySelectorAll('.game-object');
    objects.forEach(object => {
        object.dataset.speed = currentSpeed;
    });
}

// Gestion de la temperature :
function increaseTemperature() {
    temperature += 0.02;  // Ralentit l'augmentation de la température
    viewTemperature = temperature.toFixed(2);
    temperatureDisplay.innerText = `Température: ${viewTemperature}°C`;
    if (viewTemperature >= 100) {
        endGame();
    }
}


// Fonction : popup affichant un message avec le score du joueur lorsque la partie est terminée (le joueur a perdu) :
function endGame(){
    cancelAnimationFrame(gameLoop);
    const gameOverMessage = document.createElement('div');
    gameOverMessage.id = 'gameOverMessage';
    gameOverMessage.innerHTML = `
                                <div class="content_popup">
                                <h2 class="GameOver_popupTitle">Game Over</h2>
                                <p>Votre travailleur a trop chaud</p>
                                <p>${pseudo} votre score final est : ${score}</p>	
                                <button onclick="resetAndStartGame()" class="GameOver_popupBtn" id="BtnOverGame">Rejouer</button>	
                                </div>`;
    gameContainer.appendChild(gameOverMessage);
    document.querySelectorAll('.game-object').forEach(obj => {
        obj.style.animationPlayState = 'paused';
    });

}
// Vérifie si la temperature est superieur ou egale a 100%
function checkGameOver() {
    if (temperature >= 100) {
        endGame();
        return true;
    }
    return false;
}

// Réinitialisation du jeu
function resetGame() {
    baseSpeed = 1;
    currentSpeed = baseSpeed;
    score = 0;
    temperature = 0;
    environment = 'chantier';
    scoreDisplay.innerText = `Score: ${score}`;
    temperatureDisplay.innerText = `Température: ${temperature}°C`;
    character.style.left = '50%'; // Position du PNJ
    gameContainer.style.backgroundImage = "url('assets/images/background-chantier.png')";
    document.querySelectorAll('.game-object').forEach(obj => obj.remove());
    characterPosition = centralLeft + (centralWidth / 2) - (character.clientWidth / 2);

}
function resetAndStartGame() {
    // Supprimer le message de fin de jeu s'il existe
    const gameOverMessage = document.getElementById('gameOverMessage');
    if (gameOverMessage) {
        gameOverMessage.remove();
    }

    // Réinitialiser le jeu
    resetGame();

    // Redémarrer la boucle de jeu
    gameLoop();
}

// Boucle du jeu pour gérer les mises à jour
function gameLoop() {
    if(!checkGameOver()){
        increaseScore();
        increaseTemperature();
        moveObjects();
        // Apparition aléatoire d'objets (ralentie)
        if (Math.random() < 0.03) {  // Semelles apparaissent moins fréquemment
            createObject('semelle');
            createObject('panneau_inflammable');
        }
        if (Math.random() < 0.01) {  // Objets obstacles apparaissent moins fréquemment
            createObject('pelle');
            createObject('marteau');
        }
        if (Math.random() < 0.01) {
            createObject('panneau_verglas');
            createObject('flaque');
        }

        // Continue la boucle du jeu
        setTimeout(gameLoop, 1000 / 60); // 60 FPS
        //gameLoopId = requestAnimationFrame(gameLoop);
    }
}
// Création d'un nouvel objet
function createObject(type) {

    const asset = assets[type];
    const object = document.createElement('div');
    object.classList.add('game-object', asset.className);
    object.style.backgroundImage = `url('${asset.imageSrc}')`;
    object.style.width = `${asset.width}px`;
    object.style.height = `${asset.height}px`;
    object.style.position = 'absolute';
    object.style.top = `${centralTop}px`; // Position aléatoire dans la partie centrale
    object.dataset.speed = currentSpeed;
    const existingObjects = Array.from(gameContainer.querySelectorAll('.game-object'));
    let leftPosition;
    let isColliding;
    let attempts = 0; // Nombre de tentative initial
    const maxAttempts = 50; // Nombre de tentative maximum autorisé pour positioner un objet
    // Instruction évitant à l'objet d'entrer en collision lors de leur création :
    do{        
        isColliding = false;
        leftPosition = Math.random() * (centralWidth - asset.width) + centralLeft; // Génère l'axe x de la création de l'objet
        object.style.left = `${leftPosition}px`;
        for (let existingObj of existingObjects) {
            const existingLeft = parseInt(existingObj.style.left);
            if (Math.abs(leftPosition - existingLeft) < asset.width) {
                isColliding = true;
                break;
            }
        }
        //object.style.left = `${Math.random() * (centralWidth - asset.width) + centralLeft}px`; // Position aléatoire dans la partie centrale 
        attempts++; // Incrémentation du nombre de tentative 
    }while(isColliding && attempts < maxAttempts);
    if(!isColliding){ // Si il n'y à pas de collision, génère l'objet
       gameContainer.appendChild(object); 
       console.log(`Objet placé après ${attempts} tentatives`);
    }else {
        console.log("Impossible de placer l'objet après le nombre maximal de tentatives");
    }
    
}

// Gestion des touches de déplacement
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' && characterPosition > centralLeft) {
        characterPosition -= 10; // Vitesse de placement vers la gauche 
    } else if (event.key === 'ArrowRight' && characterPosition < centralRight - character.clientWidth) {
        characterPosition += 10; // Vitesse de placement vers la droite
    }
    character.style.left = `${characterPosition}px`;
});
window.Gamestart = function(){
    var menu = document.getElementById("gameMenu");
    pseudo = document.getElementById("pseudo").value
    console.log(pseudo)
    menu.style.display = "none"
    resetGame();  // Réinitialise le jeu (Cette fonction permet au joueur de déplacer le PNJ)
    gameLoop();  // Vitesse de déplacement à gauche
}