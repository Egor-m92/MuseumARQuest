// ===== ОБЩИЕ ПЕРЕМЕННЫЕ =====
let currentARSystem = null;
let mindarFaceScene = null;

// ===== ИГРА С ВАЗОЙ =====
const gameState = {
    totalPieces: 12,
    placedPieces: 0,
    startTime: null,
    timerInterval: null,
    pieces: [],
    targetPositions: [],
    vaseImageUrl: './assets/vaza.jpg',
    isDragging: false,
    draggedPiece: null,
    dragOffset: { x: 0, y: 0 },
    imageActualRect: null
};

const fragmentsArea = document.getElementById('fragmentsArea');
const vaseArea = document.getElementById('vaseArea');
const vaseImage = document.getElementById('vaseImage');

// ===== ИГРА С ОРНАМЕНТОМ =====
const ornamentGameState = {
    playerGrid: [],
    targetGrid: [],
    gameCompleted: false,
    gridSize: 25,
    cellSize: 0,
    canvasSize: 400,
    targetCellsCount: 0
};

const ornamentColors = {
    cellColor: '#ff3333',
    gridColor: '#8b0000',
    hintColor: '#4a7c4a',
    backgroundColor: '#ffffff'
};

const ornamentTargetCells = [
    12, 36, 37, 38, 60, 61, 62, 63, 64, 86, 87, 88, 112,
    163, 139, 115, 91, 116, 141, 166, 191, 215, 239, 263, 238, 213, 188, 214, 189, 164, 190, 165, 140,
    161, 135, 109, 83, 186, 211, 236, 261, 235, 209, 183, 158, 133, 108, 210, 184, 185, 160, 159, 134,
    287, 311, 313, 337,
    289, 265, 241, 217, 218, 219, 220, 221, 290, 291, 292, 293, 269, 245, 242, 243, 244, 268, 267, 266,
    339, 340, 341, 342, 343, 369, 395, 421, 365, 391, 417, 418, 419, 420, 366, 367, 368, 392, 393, 394,
    320, 296, 321, 346, 272, 297, 322, 347, 372, 348, 323, 298, 324,
    363, 361, 389, 415, 441, 385, 409, 433, 388, 414, 440, 466, 491, 516, 541, 463, 438, 413, 439, 465, 464, 489, 490, 515,
    386, 411, 436, 461, 410, 434, 458, 483, 508, 533, 509, 485, 460, 435, 459, 484,
    512, 536, 537, 538, 560, 561, 562, 563, 564, 586, 587, 588, 612,
    285, 259, 233, 207, 206, 205, 204, 203, 229, 255, 281, 282, 283, 284, 258, 257, 256, 230, 231, 232, 335,
    334, 333, 332, 331, 355, 379, 359, 383, 407, 406, 405, 404, 403, 380, 381, 382, 358, 357, 356, 304, 278, 303, 328, 352, 327, 302, 277, 252, 276, 301, 326, 300
];

// ===== ИГРА С ШИФРОМ =====
const cipherGameState = {
    currentPhrase: '',
    encodedPhrase: '',
    userInput: '',
    alphabet: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
    phrases: [
        'добрушскийрайон', 'музейнаятайна', 'древнийсвиток',
        'историянарода', 'княгиняпаскевич', 'белорусскийорнамент',
        'культурноенаследие', 'памятьпоколений', 'роднаязямля'
    ],
    hints: [
        'Название района', 'Что хранит экспонаты', 'Древний документ',
        'Прошлое народа', 'Основательница школы', 'Традиционный узор',
        'Что передаем потомкам', 'Связь времен', 'Любимая земля'
    ],
    currentHint: '',
    gameCompleted: false
};

// ===== MINDAR FACE СЦЕНА =====
const mindarFaceState = {
    faceTracked: false,
    photos: [],
    maxPhotos: 9,
    captureCanvas: null
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        showPrologue();
    }, 2500);
});

// ===== ФУНКЦИИ АНИМАЦИИ =====
function showScreenWithAnimation(screenElement) {
    screenElement.classList.remove('hidden');
    screenElement.classList.add('screen-slide-up');
    setTimeout(() => screenElement.classList.remove('screen-slide-up'), 500);
}

function hideScreenWithAnimation(screenElement) {
    return new Promise((resolve) => {
        screenElement.classList.add('screen-slide-down');
        setTimeout(() => {
            screenElement.classList.add('hidden');
            screenElement.classList.remove('screen-slide-down');
            resolve();
        }, 400);
    });
}

function showPrologue() {
    const prologue = document.getElementById('prologue');
    showScreenWithAnimation(prologue);
    animatePrologueText();
}

// ===== ПРОЛОГ =====
function animatePrologueText() {
    const text = document.getElementById('prologue-text');
    const originalText = text.textContent;
    text.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
        if (i < originalText.length) {
            text.textContent += originalText[i];
            i++;
        } else {
            clearInterval(interval);
        }
    }, 30);
}

// ===== ПЕРВЫЙ КВЕСТ (ШКОЛА) =====
async function startFirstQuest() {
    await hideScreenWithAnimation(document.getElementById('prologue'));
    document.getElementById('ar-scene-school').classList.remove('hidden');
    
    const sceneEl = document.querySelector('#ar-scene-school a-scene');
    if (sceneEl.hasLoaded) {
        initSchoolAR(sceneEl);
    } else {
        sceneEl.addEventListener('loaded', () => initSchoolAR(sceneEl));
    }
}

function initSchoolAR(sceneEl) {
    const arSystem = sceneEl.systems["mindar-image-system"];
    currentARSystem = arSystem;
    arSystem.start();
    
    const target = document.getElementById('school-target');
    let isContentVisible = false;
    
    target.addEventListener('targetFound', () => {
        if (!isContentVisible) {
            isContentVisible = true;
            setTimeout(() => showSchoolContent(arSystem), 500);
        }
    });
}

function showSchoolContent(arSystem) {
    arSystem.stop();
    currentARSystem = null;
    document.getElementById('ar-scene-school').classList.add('hidden');
    showScreenWithAnimation(document.getElementById('ar-content-school'));
}

async function closeSchoolContent() {
    await hideScreenWithAnimation(document.getElementById('ar-content-school'));
    document.getElementById('ar-scene-school').classList.remove('hidden');
    
    const sceneEl = document.querySelector('#ar-scene-school a-scene');
    const arSystem = sceneEl.systems["mindar-image-system"];
    arSystem.start();
    currentARSystem = arSystem;
}

// ===== ВТОРОЙ КВЕСТ (ВАЗА) =====
async function startVaseQuest() {
    await hideScreenWithAnimation(document.getElementById('ar-content-school'));
    document.getElementById('ar-scene-school').classList.add('hidden');
    
    if (currentARSystem) {
        currentARSystem.stop();
        currentARSystem = null;
    }
    
    document.getElementById('ar-scene-vase').classList.remove('hidden');
    
    const sceneEl = document.querySelector('#ar-scene-vase a-scene');
    if (sceneEl.hasLoaded) {
        initVaseAR(sceneEl);
    } else {
        sceneEl.addEventListener('loaded', () => initVaseAR(sceneEl));
    }
}

function initVaseAR(sceneEl) {
    const arSystem = sceneEl.systems["mindar-image-system"];
    currentARSystem = arSystem;
    arSystem.start();
    
    const target = document.getElementById('vase-target');
    let isGameStarted = false;
    
    target.addEventListener('targetFound', () => {
        if (!isGameStarted) {
            isGameStarted = true;
            arSystem.stop();
            currentARSystem = null;
            document.getElementById('ar-scene-vase').classList.add('hidden');
            startGame();
        }
    });
}

function startGame() {
    showScreenWithAnimation(document.getElementById('game-screen'));
    initGame();
}

// ===== ТРЕТИЙ КВЕСТ (ОРНАМЕНТ) =====
async function startOrnamentQuest() {
    await Promise.all([
        hideScreenWithAnimation(document.getElementById('ar-content-school')),
        hideScreenWithAnimation(document.getElementById('game-screen'))
    ]);
    
    document.getElementById('ar-scene-school').classList.add('hidden');
    document.getElementById('ar-scene-vase').classList.add('hidden');
    document.getElementById('winMessage').style.display = 'none';
    
    if (currentARSystem) {
        currentARSystem.stop();
        currentARSystem = null;
    }
    
    document.getElementById('ar-scene-ornament').classList.remove('hidden');
    
    const sceneEl = document.querySelector('#ar-scene-ornament a-scene');
    if (sceneEl.hasLoaded) {
        initOrnamentAR(sceneEl);
    } else {
        sceneEl.addEventListener('loaded', () => initOrnamentAR(sceneEl));
    }
}

function initOrnamentAR(sceneEl) {
    const arSystem = sceneEl.systems["mindar-image-system"];
    currentARSystem = arSystem;
    arSystem.start();
    
    const target = document.getElementById('ornament-target');
    let isGameStarted = false;
    
    target.addEventListener('targetFound', () => {
        if (!isGameStarted) {
            isGameStarted = true;
            arSystem.stop();
            currentARSystem = null;
            document.getElementById('ar-scene-ornament').classList.add('hidden');
            showOrnamentGame();
        }
    });
}

function showOrnamentGame() {
    showScreenWithAnimation(document.getElementById('ornament-game-screen'));
    initOrnamentGame();
}

// ===== ЧЕТВЕРТЫЙ КВЕСТ (ШИФР) =====
async function startCipherQuest() {
    await Promise.all([
        hideScreenWithAnimation(document.getElementById('ar-content-school')),
        hideScreenWithAnimation(document.getElementById('game-screen')),
        hideScreenWithAnimation(document.getElementById('ornament-game-screen'))
    ]);
    
    document.getElementById('ar-scene-school').classList.add('hidden');
    document.getElementById('ar-scene-vase').classList.add('hidden');
    document.getElementById('ar-scene-ornament').classList.add('hidden');
    document.getElementById('winMessage').style.display = 'none';
    document.getElementById('ornamentResultMessage').style.display = 'none';
    
    if (currentARSystem) {
        currentARSystem.stop();
        currentARSystem = null;
    }
    
    document.getElementById('ar-scene-cipher').classList.remove('hidden');
    
    const sceneEl = document.querySelector('#ar-scene-cipher a-scene');
    if (sceneEl.hasLoaded) {
        initCipherAR(sceneEl);
    } else {
        sceneEl.addEventListener('loaded', () => initCipherAR(sceneEl));
    }
}

function initCipherAR(sceneEl) {
    const arSystem = sceneEl.systems["mindar-image-system"];
    currentARSystem = arSystem;
    arSystem.start();
    
    const target = document.getElementById('cipher-target');
    let isGameStarted = false;
    
    target.addEventListener('targetFound', () => {
        if (!isGameStarted) {
            isGameStarted = true;
            arSystem.stop();
            currentARSystem = null;
            document.getElementById('ar-scene-cipher').classList.add('hidden');
            showCipherGame();
        }
    });
}

function showCipherGame() {
    showScreenWithAnimation(document.getElementById('cipher-game-screen'));
    initCipherGame();
}

// ===== ИГРА С ВАЗОЙ (ЛОГИКА) =====
function initGame() {
    gameState.placedPieces = 0;
    gameState.startTime = Date.now();
    gameState.pieces = [];
    gameState.targetPositions = [];
    gameState.isDragging = false;
    gameState.draggedPiece = null;
    gameState.imageActualRect = null;

    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    document.getElementById('winMessage').style.display = 'none';
    fragmentsArea.innerHTML = '';
    
    const existingPieces = vaseArea.querySelectorAll('.puzzle-piece');
    existingPieces.forEach(p => p.remove());

    const img = new Image();
    img.onload = function() {
        const processedVaseCanvas = removeWhiteBackground(img);
        vaseImage.src = processedVaseCanvas.toDataURL();
        vaseImage.style.opacity = '0.3';
        vaseImage.style.display = 'block';
        
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    resizeObserver.disconnect();
                    createPuzzlePieces(img);
                    break;
                }
            }
        });
        
        resizeObserver.observe(fragmentsArea);
        
        setTimeout(() => {
            resizeObserver.disconnect();
            if (gameState.pieces.length === 0) {
                createPuzzlePieces(img);
            }
        }, 500);
    };
    
    img.onerror = function() {
        const fallbackImg = new Image();
        fallbackImg.onload = function() {
            const processedVaseCanvas = removeWhiteBackground(fallbackImg);
            vaseImage.src = processedVaseCanvas.toDataURL();
            vaseImage.style.opacity = '0.3';
            vaseImage.style.display = 'block';
            setTimeout(() => createPuzzlePieces(fallbackImg), 100);
        };
        fallbackImg.src = gameState.vaseImageUrl;
    };
    img.src = gameState.vaseImageUrl;

    gameState.timerInterval = setInterval(updateTimer, 1000);
    updateUI();
}

function removeWhiteBackground(srcImage) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = srcImage.width;
    canvas.height = srcImage.height;
    ctx.drawImage(srcImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        if ((r > 240 && g > 240 && b > 240) || 
            (r > 200 && g > 200 && b > 200 && Math.abs(r-g) < 20 && Math.abs(g-b) < 20)) {
            data[i+3] = 0;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

function getImageDisplayRect() {
    const img = document.getElementById('vaseImage');
    const rect = img.getBoundingClientRect();
    const vaseRect = vaseArea.getBoundingClientRect();
    return {
        left: rect.left - vaseRect.left,
        top: rect.top - vaseRect.top,
        width: rect.width,
        height: rect.height
    };
}

function createPuzzlePieces(srcImage) {
    const rows = 4, cols = 3;
    const displayRect = getImageDisplayRect();
    gameState.imageActualRect = displayRect;
    
    const pieceWidth = displayRect.width / cols;
    const pieceHeight = displayRect.height / rows;
    const processedCanvas = removeWhiteBackground(srcImage);
    const processedImageUrl = processedCanvas.toDataURL();
    
    const fragmentsRect = fragmentsArea.getBoundingClientRect();
    const panelWidth = fragmentsRect.width;
    const panelHeight = fragmentsRect.height;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const index = row * cols + col;
            if (index >= gameState.totalPieces) break;

            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.id = `piece-${index}`;
            piece.style.width = pieceWidth + 'px';
            piece.style.height = pieceHeight + 'px';
            piece.dataset.index = index;

            const canvas = document.createElement('canvas');
            canvas.width = pieceWidth;
            canvas.height = pieceHeight;
            const ctx = canvas.getContext('2d');

            const pieceImg = new Image();
            pieceImg.onload = function() {
                const sx = (pieceImg.width / cols) * col;
                const sy = (pieceImg.height / rows) * row;
                const sWidth = pieceImg.width / cols;
                const sHeight = pieceImg.height / rows;

                ctx.clearRect(0, 0, pieceWidth, pieceHeight);
                ctx.drawImage(pieceImg, sx, sy, sWidth, sHeight, 0, 0, pieceWidth, pieceHeight);
                addCeramicTexture(ctx, pieceWidth, pieceHeight);
                piece.style.backgroundImage = `url(${canvas.toDataURL()})`;
                piece.style.backgroundSize = 'cover';
            };
            pieceImg.src = processedImageUrl;

            const margin = 5;
            const maxX = Math.max(margin, panelWidth - pieceWidth - margin * 2);
            const maxY = Math.max(margin, panelHeight - pieceHeight - margin * 2);
            
            piece.style.left = (margin + Math.random() * maxX) + 'px';
            piece.style.top = (margin + Math.random() * maxY) + 'px';

            gameState.targetPositions.push({
                x: displayRect.left + (col * pieceWidth) + (pieceWidth / 2),
                y: displayRect.top + (row * pieceHeight) + (pieceHeight / 2),
                tolerance: Math.min(pieceWidth, pieceHeight) * 0.4
            });

            makeDraggable(piece, index);
            fragmentsArea.appendChild(piece);
            gameState.pieces.push(piece);
        }
    }
}

function addCeramicTexture(ctx, width, height) {
    ctx.globalCompositeOperation = 'multiply';
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(139,69,19,0.3)');
    gradient.addColorStop(0.5, 'rgba(160,82,45,0.2)');
    gradient.addColorStop(1, 'rgba(92,64,51,0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
}

function makeDraggable(element) {
    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDrag, {passive: false});
}

function startDrag(e) {
    const element = e.currentTarget;
    if (element.classList.contains('placed')) return;

    e.preventDefault();
    e.stopPropagation();

    gameState.isDragging = true;
    gameState.draggedPiece = element;
    element.classList.add('dragging');

    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    const rect = element.getBoundingClientRect();
    gameState.dragOffset.x = clientX - rect.left;
    gameState.dragOffset.y = clientY - rect.top;

    document.body.appendChild(element);
    element.style.left = rect.left + 'px';
    element.style.top = rect.top + 'px';

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', drag, {passive: false});
    document.addEventListener('touchend', endDrag);
}

function drag(e) {
    if (!gameState.isDragging || !gameState.draggedPiece) return;
    e.preventDefault();

    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    gameState.draggedPiece.style.left = (clientX - gameState.dragOffset.x) + 'px';
    gameState.draggedPiece.style.top = (clientY - gameState.dragOffset.y) + 'px';
}

function endDrag(e) {
    if (!gameState.isDragging || !gameState.draggedPiece) return;

    const piece = gameState.draggedPiece;
    const index = parseInt(piece.dataset.index);

    gameState.isDragging = false;
    piece.classList.remove('dragging');

    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', endDrag);

    checkPlacement(piece, index);
    gameState.draggedPiece = null;
}

function checkPlacement(piece, index) {
    const pieceRect = piece.getBoundingClientRect();
    const vaseRect = vaseArea.getBoundingClientRect();
    const target = gameState.targetPositions[index];

    const pieceCenterX = pieceRect.left + pieceRect.width/2 - vaseRect.left;
    const pieceCenterY = pieceRect.top + pieceRect.height/2 - vaseRect.top;

    const distance = Math.sqrt(
        Math.pow(pieceCenterX - target.x, 2) + 
        Math.pow(pieceCenterY - target.y, 2)
    );

    if (distance < target.tolerance) {
        placePiece(piece, index, target);
    } else {
        returnToFragments(piece);
    }
}

function placePiece(piece, index, target) {
    vaseArea.appendChild(piece);
    piece.style.left = (target.x - piece.offsetWidth/2) + 'px';
    piece.style.top = (target.y - piece.offsetHeight/2) + 'px';
    piece.classList.add('placed');

    gameState.placedPieces++;
    updateUI();

    if (gameState.placedPieces === gameState.totalPieces) {
        setTimeout(showWin, 500);
    }
}

function returnToFragments(piece) {
    fragmentsArea.appendChild(piece);
    
    const fragmentsRect = fragmentsArea.getBoundingClientRect();
    const pieceRect = piece.getBoundingClientRect();
    const panelWidth = fragmentsRect.width;
    const panelHeight = fragmentsRect.height;
    const margin = 5;
    
    piece.style.left = (margin + Math.random() * Math.max(margin, panelWidth - pieceRect.width - margin * 2)) + 'px';
    piece.style.top = (margin + Math.random() * Math.max(margin, panelHeight - pieceRect.height - margin * 2)) + 'px';
}

function updateUI() {
    document.getElementById('placedCount').textContent = gameState.placedPieces;
    document.getElementById('piecesCount').textContent = gameState.placedPieces;
    document.getElementById('totalPieces').textContent = gameState.totalPieces;

    const accuracy = Math.round((gameState.placedPieces / gameState.totalPieces) * 100);
    document.getElementById('accuracy').textContent = accuracy + '%';
    document.getElementById('progressFill').style.width = accuracy + '%';
    vaseImage.style.opacity = 0.3 + (accuracy / 100) * 0.7;
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('timer').textContent = 
        minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
}

function showWin() {
    clearInterval(gameState.timerInterval);
    document.getElementById('finalTime').textContent = document.getElementById('timer').textContent;
    
    const winMessage = document.getElementById('winMessage');
    winMessage.style.display = 'flex';
    winMessage.classList.add('screen-slide-up');
    setTimeout(() => winMessage.classList.remove('screen-slide-up'), 500);
    vaseImage.style.opacity = '1';
}

function restartGame() {
    document.getElementById('winMessage').style.display = 'none';
    initGame();
}

async function backToMuseum() {
    await hideScreenWithAnimation(document.getElementById('game-screen'));
    document.getElementById('winMessage').style.display = 'none';
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    showPrologue();
}

// ===== ИГРА С ОРНАМЕНТОМ (ЛОГИКА) =====
function initOrnamentGame() {
    ornamentGameState.canvasSize = getOrnamentCanvasSize();
    
    const canvas = document.getElementById('ornamentGameCanvas');
    canvas.width = ornamentGameState.canvasSize;
    canvas.height = ornamentGameState.canvasSize;
    
    ornamentGameState.cellSize = ornamentGameState.canvasSize / ornamentGameState.gridSize;
    ornamentGameState.gameCompleted = false;
    
    ornamentGameState.playerGrid = Array(ornamentGameState.gridSize * ornamentGameState.gridSize).fill(false);
    ornamentGameState.targetGrid = Array(ornamentGameState.gridSize * ornamentGameState.gridSize).fill(false);
    
    ornamentTargetCells.forEach(cellIndex => {
        if (cellIndex >= 0 && cellIndex < ornamentGameState.targetGrid.length) {
            ornamentGameState.targetGrid[cellIndex] = true;
        }
    });
    
    ornamentGameState.targetCellsCount = ornamentTargetCells.length;
    document.getElementById('ornamentTotalCount').textContent = ornamentGameState.targetCellsCount;
    
    drawOrnamentGame();
    updateOrnamentUI();
}

function getOrnamentCanvasSize() {
    const isMobile = window.innerWidth <= 768;
    const maxSize = Math.min(window.innerWidth - 40, 500);
    return isMobile ? Math.min(maxSize, 350) : 400;
}

function drawOrnamentGame() {
    const canvas = document.getElementById('ornamentGameCanvas');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = ornamentColors.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawOrnamentGrid(ctx);
    drawOrnamentPlayerCells(ctx);
    drawOrnamentTargetPattern(ctx);
}

function drawOrnamentGrid(ctx) {
    ctx.strokeStyle = ornamentColors.gridColor;
    ctx.lineWidth = Math.max(1, ornamentGameState.canvasSize / 400);
    
    for (let i = 0; i <= ornamentGameState.gridSize; i++) {
        const x = i * ornamentGameState.cellSize;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ornamentGameState.canvasSize);
        ctx.stroke();
        
        const y = i * ornamentGameState.cellSize;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ornamentGameState.canvasSize, y);
        ctx.stroke();
    }
}

function drawOrnamentPlayerCells(ctx) {
    for (let i = 0; i < ornamentGameState.playerGrid.length; i++) {
        if (ornamentGameState.playerGrid[i]) {
            const row = Math.floor(i / ornamentGameState.gridSize);
            const col = i % ornamentGameState.gridSize;
            ctx.fillStyle = ornamentColors.cellColor;
            ctx.fillRect(
                col * ornamentGameState.cellSize + 1,
                row * ornamentGameState.cellSize + 1,
                ornamentGameState.cellSize - 2,
                ornamentGameState.cellSize - 2
            );
        }
    }
}

function drawOrnamentTargetPattern(ctx) {
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < ornamentGameState.targetGrid.length; i++) {
        if (ornamentGameState.targetGrid[i]) {
            const row = Math.floor(i / ornamentGameState.gridSize);
            const col = i % ornamentGameState.gridSize;
            ctx.fillStyle = ornamentColors.gridColor;
            ctx.fillRect(
                col * ornamentGameState.cellSize + 1,
                row * ornamentGameState.cellSize + 1,
                ornamentGameState.cellSize - 2,
                ornamentGameState.cellSize - 2
            );
        }
    }
    ctx.globalAlpha = 1.0;
}

function getOrnamentCellIndex(x, y) {
    const col = Math.floor(x / ornamentGameState.cellSize);
    const row = Math.floor(y / ornamentGameState.cellSize);
    if (col >= 0 && col < ornamentGameState.gridSize && row >= 0 && row < ornamentGameState.gridSize) {
        return row * ornamentGameState.gridSize + col;
    }
    return -1;
}

function handleOrnamentCellClick(cellIndex) {
    if (ornamentGameState.gameCompleted || cellIndex === -1) return;
    ornamentGameState.playerGrid[cellIndex] = !ornamentGameState.playerGrid[cellIndex];
    updateOrnamentUI();
    drawOrnamentGame();
}

function updateOrnamentUI() {
    const filledCount = ornamentGameState.playerGrid.filter(cell => cell).length;
    document.getElementById('ornamentFilledCount').textContent = filledCount;
    
    const statusDisplay = document.getElementById('ornamentStatusDisplay');
    statusDisplay.textContent = ornamentGameState.gameCompleted ? 'Завершено!' : 'В процессе';
    statusDisplay.style.color = ornamentGameState.gameCompleted ? '#4a7c4a' : '#ffcc00';
}

function checkOrnamentPattern() {
    for (let i = 0; i < ornamentGameState.targetGrid.length; i++) {
        if (ornamentGameState.targetGrid[i] && !ornamentGameState.playerGrid[i]) return false;
    }
    return true;
}

function showOrnamentResult(success) {
    if (success) {
        const accuracy = calculateOrnamentAccuracy();
        document.getElementById('ornamentResultDetails').textContent = `Точность: ${accuracy}%`;
        
        const resultMessage = document.getElementById('ornamentResultMessage');
        resultMessage.style.display = 'flex';
        resultMessage.classList.add('screen-slide-up');
        setTimeout(() => resultMessage.classList.remove('screen-slide-up'), 500);
        
        ornamentGameState.gameCompleted = true;
        updateOrnamentUI();
    } else {
        const statusDisplay = document.getElementById('ornamentStatusDisplay');
        const originalText = statusDisplay.textContent;
        statusDisplay.textContent = 'Неверно!';
        statusDisplay.style.color = '#ff3333';
        setTimeout(() => {
            statusDisplay.textContent = originalText;
            statusDisplay.style.color = ornamentGameState.gameCompleted ? '#4a7c4a' : '#ffcc00';
        }, 1500);
    }
}

function calculateOrnamentAccuracy() {
    let correct = 0, total = 0;
    for (let i = 0; i < ornamentGameState.targetGrid.length; i++) {
        if (ornamentGameState.targetGrid[i]) {
            total++;
            if (ornamentGameState.playerGrid[i]) correct++;
        }
    }
    return total > 0 ? Math.round((correct / total) * 100) : 0;
}

function showOrnamentHint() {
    if (ornamentGameState.gameCompleted) return;
    
    let hintIndex = -1;
    for (let i = 0; i < ornamentGameState.targetGrid.length; i++) {
        if (ornamentGameState.targetGrid[i] && !ornamentGameState.playerGrid[i]) {
            hintIndex = i;
            break;
        }
    }
    
    if (hintIndex !== -1) {
        const row = Math.floor(hintIndex / ornamentGameState.gridSize);
        const col = hintIndex % ornamentGameState.gridSize;
        const canvas = document.getElementById('ornamentGameCanvas');
        const ctx = canvas.getContext('2d');
        
        let blinkCount = 0;
        const blinkInterval = setInterval(() => {
            drawOrnamentGame();
            ctx.save();
            ctx.fillStyle = blinkCount % 2 === 0 ? ornamentColors.hintColor : ornamentColors.cellColor;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(
                col * ornamentGameState.cellSize + 2,
                row * ornamentGameState.cellSize + 2,
                ornamentGameState.cellSize - 4,
                ornamentGameState.cellSize - 4
            );
            ctx.restore();
            
            blinkCount++;
            if (blinkCount > 6) {
                clearInterval(blinkInterval);
                drawOrnamentGame();
            }
        }, 300);
    }
}

function clearOrnamentGame() {
    ornamentGameState.playerGrid = Array(ornamentGameState.gridSize * ornamentGameState.gridSize).fill(false);
    ornamentGameState.gameCompleted = false;
    drawOrnamentGame();
    updateOrnamentUI();
}

async function resetOrnamentGame() {
    await hideScreenWithAnimation(document.getElementById('ornamentResultMessage'));
    clearOrnamentGame();
}

async function backFromOrnament() {
    await hideScreenWithAnimation(document.getElementById('ornament-game-screen'));
    document.getElementById('ornamentResultMessage').style.display = 'none';
    showPrologue();
}

// ===== ИГРА С ШИФРОМ (ЛОГИКА) =====
function initCipherGame() {
    const randomIndex = Math.floor(Math.random() * cipherGameState.phrases.length);
    cipherGameState.currentPhrase = cipherGameState.phrases[randomIndex];
    cipherGameState.currentHint = cipherGameState.hints[randomIndex];
    cipherGameState.userInput = '';
    cipherGameState.gameCompleted = false;
    
    encodePhrase();
    
    document.getElementById('cipherEncoded').textContent = cipherGameState.encodedPhrase;
    document.getElementById('cipherHint').textContent = `💡 Подсказка: ${cipherGameState.currentHint}`;
    document.getElementById('cipherUserInput').value = '';
    
    createCipherKeyboard();
    createCipherKey();
    updateCipherProgress();
}

function encodePhrase() {
    let encoded = '';
    for (let i = 0; i < cipherGameState.currentPhrase.length; i++) {
        const char = cipherGameState.currentPhrase[i];
        const index = cipherGameState.alphabet.indexOf(char);
        if (index !== -1) {
            encoded += (index + 1).toString().padStart(2, '0') + ' ';
        }
    }
    cipherGameState.encodedPhrase = encoded.trim();
}

function createCipherKey() {
    const keyGrid = document.getElementById('cipherKey');
    keyGrid.innerHTML = '';
    
    for (let i = 1; i <= 33; i++) {
        const keyItem = document.createElement('div');
        keyItem.className = 'cipher-key-item';
        
        const numberSpan = document.createElement('span');
        numberSpan.className = 'cipher-key-number';
        numberSpan.textContent = i.toString().padStart(2, '0');
        
        const letterSpan = document.createElement('span');
        letterSpan.className = 'cipher-key-letter';
        letterSpan.textContent = cipherGameState.alphabet[i - 1].toUpperCase();
        
        keyItem.appendChild(numberSpan);
        keyItem.appendChild(letterSpan);
        keyGrid.appendChild(keyItem);
    }
}

function createCipherKeyboard() {
    const lettersContainer = document.getElementById('cipherLetters');
    lettersContainer.innerHTML = '';
    
    cipherGameState.alphabet.split('').forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'cipher-letter-btn';
        btn.textContent = letter.toUpperCase();
        btn.onclick = () => addLetterToInput(letter);
        lettersContainer.appendChild(btn);
    });
    
    const spaceBtn = document.createElement('button');
    spaceBtn.className = 'cipher-letter-btn';
    spaceBtn.textContent = '␣';
    spaceBtn.onclick = () => addLetterToInput(' ');
    lettersContainer.appendChild(spaceBtn);
    
    const backspaceBtn = document.createElement('button');
    backspaceBtn.className = 'cipher-letter-btn';
    backspaceBtn.textContent = '⌫';
    backspaceBtn.onclick = removeLastLetter;
    lettersContainer.appendChild(backspaceBtn);
}

function addLetterToInput(letter) {
    if (cipherGameState.gameCompleted) return;
    const input = document.getElementById('cipherUserInput');
    if (input.value.length < cipherGameState.currentPhrase.length) {
        input.value += letter;
        cipherGameState.userInput = input.value;
        updateCipherProgress();
    }
}

function removeLastLetter() {
    if (cipherGameState.gameCompleted) return;
    const input = document.getElementById('cipherUserInput');
    input.value = input.value.slice(0, -1);
    cipherGameState.userInput = input.value;
    updateCipherProgress();
}

function updateCipherProgress() {
    const input = document.getElementById('cipherUserInput').value;
    const targetLength = cipherGameState.currentPhrase.length;
    
    document.getElementById('cipherProgress').textContent = `${input.length}/${targetLength}`;
    document.getElementById('cipherProgressFill').style.width = (input.length / targetLength * 100) + '%';
    
    highlightCorrectLetters();
}

function highlightCorrectLetters() {
    const input = document.getElementById('cipherUserInput').value;
    document.querySelectorAll('.cipher-letter-btn').forEach(btn => {
        if (btn.textContent.length === 1 && btn.textContent !== '␣' && btn.textContent !== '⌫') {
            const letter = btn.textContent.toLowerCase();
            btn.style.background = cipherGameState.currentPhrase.includes(letter) 
                ? 'linear-gradient(135deg, #27ae60, #2ecc71)'
                : 'linear-gradient(135deg, #8b5a2b, #b8860b)';
        }
    });
}

function checkCipherPhrase() {
    const userInput = document.getElementById('cipherUserInput').value.toLowerCase().replace(/\s+/g, '');
    const target = cipherGameState.currentPhrase.toLowerCase();
    
    if (userInput === target) {
        showCipherWin();
    } else {
        const input = document.getElementById('cipherUserInput');
        input.style.borderColor = '#e74c3c';
        setTimeout(() => input.style.borderColor = '#c49a6c', 1000);
        showCipherHint(false);
    }
}

function showCipherHint(isExplicit = true) {
    const input = document.getElementById('cipherUserInput').value;
    
    if (isExplicit) {
        for (let i = 0; i < cipherGameState.currentPhrase.length; i++) {
            if (i >= input.length || input[i] !== cipherGameState.currentPhrase[i]) {
                const targetLetter = cipherGameState.currentPhrase[i];
                document.querySelectorAll('.cipher-letter-btn').forEach(btn => {
                    if (btn.textContent.toLowerCase() === targetLetter) {
                        btn.style.animation = 'pulse 0.5s infinite';
                        setTimeout(() => btn.style.animation = '', 2000);
                    }
                });
                break;
            }
        }
    } else {
        let correctCount = 0;
        for (let i = 0; i < Math.min(input.length, cipherGameState.currentPhrase.length); i++) {
            if (input[i] === cipherGameState.currentPhrase[i]) correctCount++;
        }
        const hintInfo = document.getElementById('cipherHint');
        const originalText = hintInfo.innerHTML;
        hintInfo.innerHTML = `💡 Правильно: ${correctCount} из ${cipherGameState.currentPhrase.length}`;
        setTimeout(() => hintInfo.innerHTML = originalText, 2000);
    }
}

function showCipherWin() {
    cipherGameState.gameCompleted = true;
    document.getElementById('cipherResultDetails').textContent = 'Вы расшифровали послание!';
    document.getElementById('cipherResultPhrase').textContent = cipherGameState.currentPhrase.toUpperCase();
    
    const resultMessage = document.getElementById('cipherResultMessage');
    resultMessage.style.display = 'flex';
    resultMessage.classList.add('screen-slide-up');
    setTimeout(() => resultMessage.classList.remove('screen-slide-up'), 500);
}

function clearCipherInput() {
    if (cipherGameState.gameCompleted) return;
    document.getElementById('cipherUserInput').value = '';
    cipherGameState.userInput = '';
    updateCipherProgress();
}

function restartCipherGame() {
    hideScreenWithAnimation(document.getElementById('cipherResultMessage')).then(() => initCipherGame());
}

async function backFromCipher() {
    await hideScreenWithAnimation(document.getElementById('cipher-game-screen'));
    document.getElementById('cipherResultMessage').style.display = 'none';
    showPrologue();
}

// ===== MINDAR FACE ФИНАЛЬНАЯ СЦЕНА =====
function startMindarFaceAR() {
    // Скрываем меню
    document.getElementById('final-game-screen').classList.add('hidden');
    
    // Показываем AR сцену с отслеживанием лица
    const arScene = document.getElementById('ar-scene-face-mindar');
    arScene.classList.remove('hidden');
    
    // Запускаем MindAR Face
    const sceneEl = document.querySelector('#ar-scene-face-mindar a-scene');
    
    if (sceneEl.hasLoaded) {
        initMindarFace(sceneEl);
    } else {
        sceneEl.addEventListener('loaded', () => initMindarFace(sceneEl));
    }
    
    // Показываем подсказку
    document.getElementById('mindarFaceHint').style.display = 'block';
    document.getElementById('mindarFaceControls').style.display = 'none';
    
    // Обновляем статус
    updateFaceStatus('searching', 'Поиск лица...');
}

function initMindarFace(sceneEl) {
    const faceSystem = sceneEl.systems["mindar-face"];
    mindarFaceScene = faceSystem;
    
    faceSystem.start();
    
    // Отслеживание статуса лица
    const target = document.querySelector('[mindar-face-target]');
    
    target.addEventListener('targetFound', () => {
        console.log('Face tracked!');
        updateFaceStatus('tracked', 'Лицо найдено! 🎉');
        
        // Показываем кнопки
        document.getElementById('mindarFaceHint').style.display = 'none';
        document.getElementById('mindarFaceControls').style.display = 'flex';
        
        // Активируем анимации салюта
        const fireworks = document.getElementById('fireworks-ar');
        fireworks.setAttribute('animation', 'property: scale; to: 1.2 1.2 1.2; dur: 500; loop: true; dir: alternate');
    });
    
    target.addEventListener('targetLost', () => {
        console.log('Face lost');
        updateFaceStatus('searching', 'Лицо потеряно...');
        
        document.getElementById('mindarFaceControls').style.display = 'none';
        document.getElementById('mindarFaceHint').style.display = 'block';
    });
}

function updateFaceStatus(status, text) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    statusDot.className = 'status-dot ' + status;
    statusText.textContent = text;
}

function captureMindarSelfie() {
    // Получаем canvas из AR сцены
    const canvas = document.querySelector('#ar-scene-face-mindar canvas');
    if (!canvas) return;
    
    // Создаем копию canvas
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = canvas.width;
    captureCanvas.height = canvas.height;
    
    const ctx = captureCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    
    // Добавляем водяной знак
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 4;
    ctx.textAlign = 'center';
    ctx.strokeText('🏛️ ДОБРУШСКИЙ МУЗЕЙ', captureCanvas.width/2, 80);
    ctx.fillText('🏛️ ДОБРУШСКИЙ МУЗЕЙ', captureCanvas.width/2, 80);
    
    // Добавляем дату
    ctx.font = '20px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.textAlign = 'right';
    ctx.fillText(new Date().toLocaleDateString(), captureCanvas.width - 20, captureCanvas.height - 20);
    
    const photoUrl = captureCanvas.toDataURL('image/png');
    saveMindarPhoto(photoUrl);
    
    // Эффект вспышки
    flashEffect();
    
    showNotification('📸 Фото сохранено!', 2000);
}

function saveMindarPhoto(photoUrl) {
    if (mindarFaceState.photos.length >= mindarFaceState.maxPhotos) {
        mindarFaceState.photos.shift();
    }
    
    mindarFaceState.photos.push({
        url: photoUrl,
        date: new Date().toISOString(),
        id: Date.now()
    });
    
    localStorage.setItem('museum_mindar_photos', JSON.stringify(mindarFaceState.photos));
    updateMindarGallery();
}

function updateMindarGallery() {
    const gallery = document.getElementById('finalSelfieGalleryImages');
    const container = document.getElementById('finalSelfieGallery');
    
    if (!gallery || !container) return;
    
    if (mindarFaceState.photos.length > 0) {
        container.style.display = 'block';
        gallery.innerHTML = '';
        
        mindarFaceState.photos.slice().reverse().forEach(photo => {
            const img = document.createElement('img');
            img.src = photo.url;
            img.className = 'final-gallery-image';
            img.onclick = () => downloadMindarPhoto(photo.url);
            gallery.appendChild(img);
        });
    } else {
        container.style.display = 'none';
    }
}

function downloadMindarPhoto(url) {
    const link = document.createElement('a');
    link.download = `museum-ar-${Date.now()}.png`;
    link.href = url;
    link.click();
}

function clearMindarGallery() {
    if (confirm('Очистить все фото?')) {
        mindarFaceState.photos = [];
        localStorage.removeItem('museum_mindar_photos');
        updateMindarGallery();
    }
}

function closeMindarFace() {
    if (mindarFaceScene) {
        mindarFaceScene.stop();
    }
    
    document.getElementById('ar-scene-face-mindar').classList.add('hidden');
    document.getElementById('final-game-screen').classList.remove('hidden');
    
    // Сброс статуса
    updateFaceStatus('searching', 'Ожидание лица...');
}

// ===== ФИНАЛЬНАЯ СЦЕНА (МЕНЮ) =====
async function startFinalQuest() {
    const screensToHide = [
        'ar-content-school', 'game-screen', 'ornament-game-screen', 
        'cipher-game-screen', 'ar-scene-school', 'ar-scene-vase',
        'ar-scene-ornament', 'ar-scene-cipher', 'winMessage',
        'ornamentResultMessage', 'cipherResultMessage', 'prologue',
        'ar-scene-face-mindar'
    ];
    
    screensToHide.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            if (id.includes('Message')) el.style.display = 'none';
        }
    });
    
    if (currentARSystem) {
        currentARSystem.stop();
        currentARSystem = null;
    }
    
    if (mindarFaceScene) {
        mindarFaceScene.stop();
    }
    
    stopAllVideos();
    
    const finalScreen = document.getElementById('final-game-screen');
    if (finalScreen) {
        finalScreen.classList.remove('hidden');
        finalScreen.classList.add('screen-slide-up');
        setTimeout(() => finalScreen.classList.remove('screen-slide-up'), 500);
    }
    
    // Загружаем сохраненные фото
    loadMindarGallery();
}

function stopAllVideos() {
    document.querySelectorAll('video').forEach(video => {
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
    });
}

function backFromFinal() {
    const finalScreen = document.getElementById('final-game-screen');
    finalScreen.classList.add('screen-slide-down');
    setTimeout(() => {
        finalScreen.classList.add('hidden');
        finalScreen.classList.remove('screen-slide-down');
        showPrologue();
    }, 400);
}

function loadMindarGallery() {
    const saved = localStorage.getItem('museum_mindar_photos');
    if (saved) {
        try {
            mindarFaceState.photos = JSON.parse(saved);
            updateMindarGallery();
        } catch (e) {
            console.error('Error loading gallery', e);
        }
    }
}

// Вспомогательные функции
function flashEffect() {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        opacity: 0.9;
        z-index: 10000;
        pointer-events: none;
        transition: opacity 0.3s;
    `;
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 300);
    }, 100);
}

function showNotification(message, duration) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(44,62,80,0.95);
        color: #ffd700;
        padding: 20px 40px;
        border-radius: 60px;
        z-index: 10001;
        font-size: 1.3rem;
        border: 3px solid #ffd700;
        backdrop-filter: blur(10px);
        box-shadow: 0 0 30px gold;
        animation: notificationPop 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'notificationFade 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
document.addEventListener('DOMContentLoaded', function() {
    loadMindarGallery();
    
    // Добавляем стили для уведомлений
    const style = document.createElement('style');
    style.textContent = `
        @keyframes notificationPop {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes notificationFade {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Орнамент
    setTimeout(() => {
        const canvas = document.getElementById('ornamentGameCanvas');
        if (canvas) {
            canvas.addEventListener('click', function(e) {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top) * scaleY;
                handleOrnamentCellClick(getOrnamentCellIndex(x, y));
            });
            
            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                canvas.dispatchEvent(new MouseEvent('click', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                }));
            });
        }
        
        document.getElementById('ornamentClearBtn')?.addEventListener('click', clearOrnamentGame);
        document.getElementById('ornamentCheckBtn')?.addEventListener('click', () => showOrnamentResult(checkOrnamentPattern()));
        document.getElementById('ornamentHintBtn')?.addEventListener('click', showOrnamentHint);
        document.getElementById('ornamentBackBtn')?.addEventListener('click', backFromOrnament);
        document.getElementById('ornamentRestartBtn')?.addEventListener('click', resetOrnamentGame);
        document.getElementById('ornamentBackFromWinBtn')?.addEventListener('click', backFromOrnament);
    }, 500);
    
    // Шифр
    setTimeout(() => {
        document.getElementById('cipherCheckBtn')?.addEventListener('click', checkCipherPhrase);
        document.getElementById('cipherClearBtn')?.addEventListener('click', clearCipherInput);
        document.getElementById('cipherHintBtn')?.addEventListener('click', () => showCipherHint(true));
        document.getElementById('cipherBackBtn')?.addEventListener('click', backFromCipher);
        document.getElementById('cipherRestartBtn')?.addEventListener('click', restartCipherGame);
        document.getElementById('cipherBackFromWinBtn')?.addEventListener('click', backFromCipher);
        
        const input = document.getElementById('cipherUserInput');
        if (input) {
            input.addEventListener('input', (e) => {
                if (cipherGameState.gameCompleted) {
                    e.target.value = cipherGameState.userInput;
                    return;
                }
                if (e.target.value.length > cipherGameState.currentPhrase.length) {
                    e.target.value = e.target.value.slice(0, cipherGameState.currentPhrase.length);
                }
                e.target.value = e.target.value.toLowerCase().replace(/[^а-яё\s]/g, '');
                cipherGameState.userInput = e.target.value;
                updateCipherProgress();
            });
        }
    }, 500);
});

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    if (!document.getElementById('ornament-game-screen').classList.contains('hidden')) {
        clearTimeout(window.ornamentResizeTimeout);
        window.ornamentResizeTimeout = setTimeout(() => {
            ornamentGameState.canvasSize = getOrnamentCanvasSize();
            const canvas = document.getElementById('ornamentGameCanvas');
            canvas.width = ornamentGameState.canvasSize;
            canvas.height = ornamentGameState.canvasSize;
            ornamentGameState.cellSize = ornamentGameState.canvasSize / ornamentGameState.gridSize;
            drawOrnamentGame();
        }, 250);
    }
});

// Экспорт функций
window.startFirstQuest = startFirstQuest;
window.closeSchoolContent = closeSchoolContent;
window.startVaseQuest = startVaseQuest;
window.startOrnamentQuest = startOrnamentQuest;
window.startCipherQuest = startCipherQuest;
window.startFinalQuest = startFinalQuest;
window.startMindarFaceAR = startMindarFaceAR;
window.captureMindarSelfie = captureMindarSelfie;
window.closeMindarFace = closeMindarFace;
window.clearMindarGallery = clearMindarGallery;
window.restartGame = restartGame;
window.backToMuseum = backToMuseum;
window.backFromOrnament = backFromOrnament;
window.backFromCipher = backFromCipher;
window.restartCipherGame = restartCipherGame;
window.backFromFinal = backFromFinal;