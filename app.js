// ===== ОБЩИЕ ПЕРЕМЕННЫЕ =====
let currentARSystem = null;

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

// Цвета для орнамента
const ornamentColors = {
    cellColor: '#ff3333',
    gridColor: '#8b0000',
    hintColor: '#4a7c4a',
    backgroundColor: '#ffffff'
};

// Массив индексов ячеек для белорусского орнамента
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

// ===== ИНИЦИАЛИЗАЦИЯ =====
window.addEventListener('load', () => {
    // Принудительно останавливаем face AR если он запущен
    setTimeout(() => {
        const faceScene = document.querySelector('#ar-scene-photo a-scene');
        if (faceScene && faceScene.systems && faceScene.systems['mindar-face-system']) {
            faceScene.systems['mindar-face-system'].stop();
            console.log('Face AR остановлен при загрузке');
        }
    }, 1000);
    
    // Остальной код загрузки...
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        showPrologue();
    }, 2500);
});

// ===== ФУНКЦИИ АНИМАЦИИ =====

// Функция для показа экрана с анимацией снизу
function showScreenWithAnimation(screenElement) {
    screenElement.classList.remove('hidden');
    screenElement.classList.add('screen-slide-up');
    
    setTimeout(() => {
        screenElement.classList.remove('screen-slide-up');
    }, 500);
}

// Функция для скрытия экрана с анимацией вниз
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

// Показать пролог
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
        sceneEl.addEventListener('loaded', function () {
            initSchoolAR(sceneEl);
        });
    }
}

function initSchoolAR(sceneEl) {
    const arSystem = sceneEl.systems["mindar-image-system"];
    currentARSystem = arSystem;
    
    arSystem.start();
    
    const target = document.getElementById('school-target');
    let isContentVisible = false;
    
    target.addEventListener('targetFound', () => {
        console.log('School target found');
        if (!isContentVisible) {
            isContentVisible = true;
            setTimeout(() => {
                showSchoolContent(arSystem);
            }, 500);
        }
    });
}

function showSchoolContent(arSystem) {
    arSystem.stop();
    currentARSystem = null;
    
    document.getElementById('ar-scene-school').classList.add('hidden');
    
    const content = document.getElementById('ar-content-school');
    showScreenWithAnimation(content);
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
        sceneEl.addEventListener('loaded', function () {
            initVaseAR(sceneEl);
        });
    }
}

function initVaseAR(sceneEl) {
    const arSystem = sceneEl.systems["mindar-image-system"];
    currentARSystem = arSystem;
    
    arSystem.start();
    
    const target = document.getElementById('vase-target');
    let isGameStarted = false;
    
    target.addEventListener('targetFound', () => {
        console.log('Vase target found');
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
    const gameScreen = document.getElementById('game-screen');
    showScreenWithAnimation(gameScreen);
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
        sceneEl.addEventListener('loaded', function () {
            initOrnamentAR(sceneEl);
        });
    }
}

function initOrnamentAR(sceneEl) {
    const arSystem = sceneEl.systems["mindar-image-system"];
    currentARSystem = arSystem;
    
    arSystem.start();
    
    const target = document.getElementById('ornament-target');
    let isGameStarted = false;
    
    target.addEventListener('targetFound', () => {
        console.log('Ornament target found');
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
    const ornamentScreen = document.getElementById('ornament-game-screen');
    showScreenWithAnimation(ornamentScreen);
    initOrnamentGame();
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
            
            setTimeout(() => {
                createPuzzlePieces(fallbackImg);
            }, 100);
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
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0;
        }
        else if (r > 200 && g > 200 && b > 200 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
            data[i + 3] = 0;
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
        height: rect.height,
        right: rect.right - vaseRect.left,
        bottom: rect.bottom - vaseRect.top
    };
}

function createPuzzlePieces(srcImage) {
    const rows = 4;
    const cols = 3;
    
    const displayRect = getImageDisplayRect();
    gameState.imageActualRect = displayRect;
    
    const pieceWidth = displayRect.width / cols;
    const pieceHeight = displayRect.height / rows;

    const processedCanvas = removeWhiteBackground(srcImage);
    const processedImageUrl = processedCanvas.toDataURL();

    fragmentsArea.offsetHeight;
    
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
                piece.style.backgroundColor = 'transparent';
            };
            pieceImg.src = processedImageUrl;

            const margin = 5;
            const maxX = Math.max(margin, panelWidth - pieceWidth - margin * 2);
            const maxY = Math.max(margin, panelHeight - pieceHeight - margin * 2);
            
            const randomX = margin + Math.random() * maxX;
            const randomY = margin + Math.random() * maxY;

            piece.style.left = randomX + 'px';
            piece.style.top = randomY + 'px';

            const targetX = displayRect.left + (col * pieceWidth) + (pieceWidth / 2);
            const targetY = displayRect.top + (row * pieceHeight) + (pieceHeight / 2);

            gameState.targetPositions.push({
                x: targetX,
                y: targetY,
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
    gradient.addColorStop(0, 'rgba(139, 69, 19, 0.3)');
    gradient.addColorStop(0.5, 'rgba(160, 82, 45, 0.2)');
    gradient.addColorStop(1, 'rgba(92, 64, 51, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
}

function makeDraggable(element, index) {
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

    const currentLeft = rect.left;
    const currentTop = rect.top;

    document.body.appendChild(element);
    element.style.left = currentLeft + 'px';
    element.style.top = currentTop + 'px';

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

    const newLeft = clientX - gameState.dragOffset.x;
    const newTop = clientY - gameState.dragOffset.y;

    gameState.draggedPiece.style.left = newLeft + 'px';
    gameState.draggedPiece.style.top = newTop + 'px';
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

    const isOverVase = pieceRect.left >= vaseRect.left - 100 &&
        pieceRect.right <= vaseRect.right + 100 &&
        pieceRect.top >= vaseRect.top - 100 &&
        pieceRect.bottom <= vaseRect.bottom + 100;

    const distance = Math.sqrt(
        Math.pow(pieceCenterX - target.x, 2) + 
        Math.pow(pieceCenterY - target.y, 2)
    );

    if (isOverVase && distance < target.tolerance) {
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

    piece.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
        piece.style.animation = '';
    }, 500);

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
    const pieceWidth = pieceRect.width;
    const pieceHeight = pieceRect.height;
    
    const panelWidth = fragmentsRect.width;
    const panelHeight = fragmentsRect.height;
    
    const margin = 5;
    const maxX = Math.max(margin, panelWidth - pieceWidth - margin * 2);
    const maxY = Math.max(margin, panelHeight - pieceHeight - margin * 2);
    
    piece.style.left = (margin + Math.random() * maxX) + 'px';
    piece.style.top = (margin + Math.random() * maxY) + 'px';
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
    
    setTimeout(() => {
        winMessage.classList.remove('screen-slide-up');
    }, 500);
    
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
    return isMobile ? Math.min(maxSize, 400) : 400;
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
    const canvas = document.getElementById('ornamentGameCanvas');
    ctx.strokeStyle = ornamentColors.gridColor;
    ctx.lineWidth = Math.max(1, ornamentGameState.canvasSize / 400);
    
    for (let i = 0; i <= ornamentGameState.gridSize; i++) {
        const x = i * ornamentGameState.cellSize;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        
        const y = i * ornamentGameState.cellSize;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
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
    if (ornamentGameState.gameCompleted) {
        statusDisplay.textContent = 'Завершено!';
        statusDisplay.style.color = '#4a7c4a';
    } else {
        statusDisplay.textContent = 'В процессе';
        statusDisplay.style.color = '#ffcc00';
    }
}

function checkOrnamentPattern() {
    for (let i = 0; i < ornamentGameState.targetGrid.length; i++) {
        if (ornamentGameState.targetGrid[i] && !ornamentGameState.playerGrid[i]) {
            return false;
        }
    }
    return true;
}

function showOrnamentResult(success) {
    if (success) {
        const accuracy = calculateOrnamentAccuracy();
        document.getElementById('ornamentResultDetails').textContent = 
            `Вы успешно повторили орнамент! Точность: ${accuracy}%`;
        
        const resultMessage = document.getElementById('ornamentResultMessage');
        resultMessage.style.display = 'flex';
        resultMessage.classList.add('screen-slide-up');
        
        setTimeout(() => {
            resultMessage.classList.remove('screen-slide-up');
        }, 500);
        
        ornamentGameState.gameCompleted = true;
        updateOrnamentUI();
    } else {
        const statusDisplay = document.getElementById('ornamentStatusDisplay');
        const originalStatus = statusDisplay.textContent;
        statusDisplay.textContent = 'Неверно!';
        statusDisplay.style.color = '#ff3333';
        
        setTimeout(() => {
            statusDisplay.textContent = originalStatus;
            statusDisplay.style.color = ornamentGameState.gameCompleted ? '#4a7c4a' : '#ffcc00';
        }, 1500);
    }
}

function calculateOrnamentAccuracy() {
    let correct = 0;
    let totalTarget = 0;
    
    for (let i = 0; i < ornamentGameState.targetGrid.length; i++) {
        if (ornamentGameState.targetGrid[i]) {
            totalTarget++;
            if (ornamentGameState.playerGrid[i]) {
                correct++;
            }
        }
    }
    
    return totalTarget > 0 ? Math.round((correct / totalTarget) * 100) : 0;
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

// ===== ОБРАБОТЧИКИ СОБЫТИЙ ДЛЯ ОРНАМЕНТА =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const canvas = document.getElementById('ornamentGameCanvas');
        if (canvas) {
            canvas.addEventListener('click', function(e) {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top) * scaleY;
                
                const cellIndex = getOrnamentCellIndex(x, y);
                handleOrnamentCellClick(cellIndex);
            });
            
            canvas.addEventListener('touchstart', function(e) {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('click', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                canvas.dispatchEvent(mouseEvent);
            });
        }
        
        const clearBtn = document.getElementById('ornamentClearBtn');
        if (clearBtn) clearBtn.addEventListener('click', clearOrnamentGame);
        
        const checkBtn = document.getElementById('ornamentCheckBtn');
        if (checkBtn) checkBtn.addEventListener('click', () => {
            const success = checkOrnamentPattern();
            showOrnamentResult(success);
        });
        
        const hintBtn = document.getElementById('ornamentHintBtn');
        if (hintBtn) hintBtn.addEventListener('click', showOrnamentHint);
        
        const backBtn = document.getElementById('ornamentBackBtn');
        if (backBtn) backBtn.addEventListener('click', backFromOrnament);
        
        const restartBtn = document.getElementById('ornamentRestartBtn');
        if (restartBtn) restartBtn.addEventListener('click', resetOrnamentGame);
        
        const backFromWinBtn = document.getElementById('ornamentBackFromWinBtn');
        if (backFromWinBtn) backFromWinBtn.addEventListener('click', backFromOrnament);
    }, 500);
});

// Обработка изменения размера окна для орнамента
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

// Обработка изменения размера окна для вазы
window.addEventListener('resize', () => {
    if (gameState.pieces.length > 0 && gameState.placedPieces < gameState.totalPieces) {
        const rows = 4;
        const cols = 3;
        const displayRect = getImageDisplayRect();
        
        for (let i = 0; i < gameState.pieces.length; i++) {
            if (!gameState.pieces[i].classList.contains('placed')) {
                const row = Math.floor(i / cols);
                const col = i % cols;
                const pieceWidth = displayRect.width / cols;
                const pieceHeight = displayRect.height / rows;
                
                gameState.targetPositions[i] = {
                    x: displayRect.left + (col * pieceWidth) + (pieceWidth / 2),
                    y: displayRect.top + (row * pieceHeight) + (pieceHeight / 2),
                    tolerance: Math.min(pieceWidth, pieceHeight) * 0.4
                };
            }
        }
        
        gameState.pieces.forEach((piece, i) => {
            if (piece.classList.contains('placed')) {
                const row = Math.floor(i / cols);
                const col = i % cols;
                const pieceWidth = displayRect.width / cols;
                const pieceHeight = displayRect.height / rows;
                const targetX = displayRect.left + (col * pieceWidth) + (pieceWidth / 2);
                const targetY = displayRect.top + (row * pieceHeight) + (pieceHeight / 2);
                
                piece.style.left = (targetX - piece.offsetWidth/2) + 'px';
                piece.style.top = (targetY - piece.offsetHeight/2) + 'px';
            }
        });
    }
});

// ===== ИГРА РАСШИФРУЙ ФРАЗУ =====
const cipherGameState = {
    currentPhrase: '',
    encodedPhrase: '',
    userInput: '',
    alphabet: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
    phrases: [
        'добрушскийрайон',
        'музейнаятайна',
        'древнийсвиток',
        'историянарода',
        'княгиняпаскевич',
        'белорусскийорнамент',
        'культурноенаследие',
        'памятьпоколений',
        'роднаязямля'
    ],
    hints: [
        'Название района',
        'Что хранит экспонаты',
        'Древний документ',
        'Прошлое народа',
        'Основательница школы',
        'Традиционный узор',
        'Что передаем потомкам',
        'Связь времен',
        'Любимая земля'
    ],
    currentHint: '',
    gameCompleted: false
};

// Инициализация игры с шифром
function initCipherGame() {
    // Выбираем случайную фразу
    const randomIndex = Math.floor(Math.random() * cipherGameState.phrases.length);
    cipherGameState.currentPhrase = cipherGameState.phrases[randomIndex];
    cipherGameState.currentHint = cipherGameState.hints[randomIndex];
    cipherGameState.userInput = '';
    cipherGameState.gameCompleted = false;
    
    // Шифруем фразу (цифры вместо букв)
    encodePhrase();
    
    // Обновляем интерфейс
    document.getElementById('cipherEncoded').textContent = cipherGameState.encodedPhrase;
    document.getElementById('cipherHint').textContent = `💡 Подсказка: ${cipherGameState.currentHint}`;
    document.getElementById('cipherUserInput').value = '';
    
    // Создаем клавиатуру с буквами
    createCipherKeyboard();
    
    // Создаем ключ шифра
    createCipherKey();
    
    updateCipherProgress();
}

// Шифрование фразы (каждая буква -> номер в алфавите)
function encodePhrase() {
    let encoded = '';
    for (let i = 0; i < cipherGameState.currentPhrase.length; i++) {
        const char = cipherGameState.currentPhrase[i];
        const index = cipherGameState.alphabet.indexOf(char);
        if (index !== -1) {
            // Добавляем ведущий ноль для двузначных чисел
            encoded += (index + 1).toString().padStart(2, '0') + ' ';
        } else {
            encoded += char + ' ';
        }
    }
    cipherGameState.encodedPhrase = encoded.trim();
}

// Создание ключа шифра
function createCipherKey() {
    const keyGrid = document.getElementById('cipherKey');
    keyGrid.innerHTML = '';
    
    // Показываем соответствие цифр и букв (1-33 для русского алфавита)
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

// Создание клавиатуры с буквами
function createCipherKeyboard() {
    const lettersContainer = document.getElementById('cipherLetters');
    lettersContainer.innerHTML = '';
    
    const alphabetArray = cipherGameState.alphabet.split('');
    
    alphabetArray.forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'cipher-letter-btn';
        btn.textContent = letter.toUpperCase();
        btn.onclick = () => addLetterToInput(letter);
        lettersContainer.appendChild(btn);
    });
    
    // Добавляем кнопку пробела
    const spaceBtn = document.createElement('button');
    spaceBtn.className = 'cipher-letter-btn';
    spaceBtn.textContent = '␣';
    spaceBtn.style.width = '90px';
    spaceBtn.onclick = () => addLetterToInput(' ');
    lettersContainer.appendChild(spaceBtn);
    
    // Добавляем кнопку удаления
    const backspaceBtn = document.createElement('button');
    backspaceBtn.className = 'cipher-letter-btn';
    backspaceBtn.textContent = '⌫';
    backspaceBtn.style.width = '90px';
    backspaceBtn.onclick = removeLastLetter;
    lettersContainer.appendChild(backspaceBtn);
}

// Добавить букву в поле ввода
function addLetterToInput(letter) {
    if (cipherGameState.gameCompleted) return;
    
    const input = document.getElementById('cipherUserInput');
    const currentValue = input.value;
    
    if (currentValue.length < cipherGameState.currentPhrase.length) {
        input.value = currentValue + letter;
        cipherGameState.userInput = input.value;
        updateCipherProgress();
    }
}

// Удалить последнюю букву
function removeLastLetter() {
    if (cipherGameState.gameCompleted) return;
    
    const input = document.getElementById('cipherUserInput');
    input.value = input.value.slice(0, -1);
    cipherGameState.userInput = input.value;
    updateCipherProgress();
}

// Обновить прогресс
function updateCipherProgress() {
    const input = document.getElementById('cipherUserInput').value;
    const targetLength = cipherGameState.currentPhrase.length;
    const currentLength = input.length;
    
    document.getElementById('cipherProgress').textContent = `${currentLength}/${targetLength}`;
    
    const percentage = (currentLength / targetLength) * 100;
    document.getElementById('cipherProgressFill').style.width = percentage + '%';
    
    // Подсвечиваем правильные буквы на клавиатуре
    highlightCorrectLetters();
}

// Подсветка правильных букв
function highlightCorrectLetters() {
    const input = document.getElementById('cipherUserInput').value;
    const buttons = document.querySelectorAll('.cipher-letter-btn');
    
    buttons.forEach(btn => {
        if (btn.textContent.length === 1 && btn.textContent !== '␣' && btn.textContent !== '⌫') {
            const letter = btn.textContent.toLowerCase();
            // Проверяем, есть ли эта буква в целевой фразе на текущей позиции или дальше
            if (cipherGameState.currentPhrase.includes(letter)) {
                btn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            } else {
                btn.style.background = 'linear-gradient(135deg, #8b5a2b, #b8860b)';
            }
        }
    });
}

// Проверка расшифровки
function checkCipherPhrase() {
    const userInput = document.getElementById('cipherUserInput').value;
    const normalizedInput = userInput.toLowerCase().replace(/\s+/g, '');
    const normalizedTarget = cipherGameState.currentPhrase.toLowerCase();
    
    if (normalizedInput === normalizedTarget) {
        // Победа!
        showCipherWin();
    } else {
        // Неправильно
        const statusDisplay = document.getElementById('cipherUserInput');
        statusDisplay.style.borderColor = '#e74c3c';
        statusDisplay.style.boxShadow = '0 0 10px rgba(231, 76, 60, 0.5)';
        
        setTimeout(() => {
            statusDisplay.style.borderColor = '#c49a6c';
            statusDisplay.style.boxShadow = 'none';
        }, 1000);
        
        // Показываем сколько букв правильно
        showCipherHint(false);
    }
}

// Показать подсказку
function showCipherHint(isExplicit = true) {
    const input = document.getElementById('cipherUserInput').value;
    
    if (isExplicit) {
        // Показываем первую неправильную букву
        for (let i = 0; i < cipherGameState.currentPhrase.length; i++) {
            if (i >= input.length || input[i] !== cipherGameState.currentPhrase[i]) {
                // Мигаем нужной буквой на клавиатуре
                const targetLetter = cipherGameState.currentPhrase[i];
                const buttons = document.querySelectorAll('.cipher-letter-btn');
                
                buttons.forEach(btn => {
                    if (btn.textContent.toLowerCase() === targetLetter) {
                        btn.style.animation = 'pulse 0.5s ease infinite';
                        setTimeout(() => {
                            btn.style.animation = '';
                        }, 2000);
                    }
                });
                break;
            }
        }
    } else {
        // Показываем количество правильных букв
        let correctCount = 0;
        for (let i = 0; i < Math.min(input.length, cipherGameState.currentPhrase.length); i++) {
            if (input[i] === cipherGameState.currentPhrase[i]) {
                correctCount++;
            }
        }
        
        // Временное сообщение
        const hintInfo = document.getElementById('cipherHint');
        const originalText = hintInfo.innerHTML;
        hintInfo.innerHTML = `💡 Правильно: ${correctCount} из ${cipherGameState.currentPhrase.length} букв`;
        
        setTimeout(() => {
            hintInfo.innerHTML = originalText;
        }, 2000);
    }
}

// Показать окно победы
function showCipherWin() {
    cipherGameState.gameCompleted = true;
    
    document.getElementById('cipherResultDetails').textContent = 
        'Вы успешно расшифровали древнее послание!';
    document.getElementById('cipherResultPhrase').textContent = 
        cipherGameState.currentPhrase.toUpperCase();
    
    const resultMessage = document.getElementById('cipherResultMessage');
    resultMessage.style.display = 'flex';
    resultMessage.classList.add('screen-slide-up');
    
    setTimeout(() => {
        resultMessage.classList.remove('screen-slide-up');
    }, 500);
}

// Очистить поле ввода
function clearCipherInput() {
    if (cipherGameState.gameCompleted) return;
    
    document.getElementById('cipherUserInput').value = '';
    cipherGameState.userInput = '';
    updateCipherProgress();
}

// Перезапустить игру с новой фразой
function restartCipherGame() {
    hideScreenWithAnimation(document.getElementById('cipherResultMessage')).then(() => {
        initCipherGame();
    });
}

// Вернуться в музей из игры с шифром
async function backFromCipher() {
    await hideScreenWithAnimation(document.getElementById('cipher-game-screen'));
    document.getElementById('cipherResultMessage').style.display = 'none';
    showPrologue();
}

// Запуск четвертого квеста (шифр)
async function startCipherQuest() {
    await Promise.all([
        hideScreenWithAnimation(document.getElementById('ar-content-school')),
        hideScreenWithAnimation(document.getElementById('game-screen')),
        hideScreenWithAnimation(document.getElementById('ornament-game-screen'))
    ].filter(p => p !== undefined));
    
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
        sceneEl.addEventListener('loaded', function () {
            initCipherAR(sceneEl);
        });
    }
}

function initCipherAR(sceneEl) {
    const arSystem = sceneEl.systems["mindar-image-system"];
    currentARSystem = arSystem;
    
    arSystem.start();
    
    const target = document.getElementById('cipher-target');
    let isGameStarted = false;
    
    target.addEventListener('targetFound', () => {
        console.log('Cipher target found');
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
    const cipherScreen = document.getElementById('cipher-game-screen');
    showScreenWithAnimation(cipherScreen);
    initCipherGame();
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ ДЛЯ ШИФРА =====
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчики для шифра с задержкой
    setTimeout(() => {
        const checkBtn = document.getElementById('cipherCheckBtn');
        if (checkBtn) checkBtn.addEventListener('click', checkCipherPhrase);
        
        const clearBtn = document.getElementById('cipherClearBtn');
        if (clearBtn) clearBtn.addEventListener('click', clearCipherInput);
        
        const hintBtn = document.getElementById('cipherHintBtn');
        if (hintBtn) hintBtn.addEventListener('click', () => showCipherHint(true));
        
        const backBtn = document.getElementById('cipherBackBtn');
        if (backBtn) backBtn.addEventListener('click', backFromCipher);
        
        const restartBtn = document.getElementById('cipherRestartBtn');
        if (restartBtn) restartBtn.addEventListener('click', restartCipherGame);
        
        const backFromWinBtn = document.getElementById('cipherBackFromWinBtn');
        if (backFromWinBtn) backFromWinBtn.addEventListener('click', backFromCipher);
        
        // Обработчик ввода с клавиатуры
        const input = document.getElementById('cipherUserInput');
        if (input) {
            input.addEventListener('input', (e) => {
                if (cipherGameState.gameCompleted) {
                    e.target.value = cipherGameState.userInput;
                    return;
                }
                
                // Ограничиваем длину
                if (e.target.value.length > cipherGameState.currentPhrase.length) {
                    e.target.value = e.target.value.slice(0, cipherGameState.currentPhrase.length);
                }
                
                // Приводим к нижнему регистру
                e.target.value = e.target.value.toLowerCase().replace(/[^а-яё\s]/g, '');
                
                cipherGameState.userInput = e.target.value;
                updateCipherProgress();
            });
        }
    }, 500);
});

// ===== AR TRACKING ЛИЦА С ЛОГОТИПОМ =====
let faceARSystem = null;
let faceScene = null;

// Функция запуска финального квеста
async function startFinalQuest() {
    console.log('Запуск финального квеста...');
    
    // Скрываем предыдущие экраны
    document.getElementById('cipherResultMessage')?.classList.add('hidden');
    document.getElementById('cipher-game-screen')?.classList.add('hidden');
    
    // Останавливаем все предыдущие AR системы
    if (currentARSystem) {
        try {
            currentARSystem.stop();
        } catch (e) {
            console.log('Ошибка при остановке предыдущей системы:', e);
        }
    }
    
    // Показываем AR сцену
    const arPhoto = document.getElementById('ar-scene-photo');
    arPhoto.classList.remove('hidden');
    
    // Даём время DOM обновиться
    setTimeout(() => {
        initFaceAR();
    }, 500);
}

// Инициализация Face AR
function initFaceAR() {
    console.log('Инициализация Face AR...');
    
    faceScene = document.querySelector('#ar-scene-photo a-scene');
    
    if (!faceScene) {
        console.error('Сцена не найдена!');
        return;
    }
    
    // Проверяем загрузку сцены
    if (faceScene.hasLoaded) {
        setupFaceAR();
    } else {
        faceScene.addEventListener('loaded', setupFaceAR);
    }
}

function setupFaceAR() {
    console.log('Сцена загружена, настройка Face AR...');
    
    // Получаем систему MindAR
    faceARSystem = faceScene.systems['mindar-face-system'];
    
    if (!faceARSystem) {
        console.error('MindAR Face System не найдена!');
        // Пробуем получить через компонент
        setTimeout(() => {
            faceARSystem = faceScene.systems['mindar-face-system'];
            if (faceARSystem) {
                startFaceTracking();
            } else {
                console.error('Не удалось получить доступ к MindAR Face System');
            }
        }, 1000);
        return;
    }
    
    startFaceTracking();
}

function startFaceTracking() {
    console.log('Запуск Face AR...');
    
    try {
        // Запускаем систему
        faceARSystem.start();
        console.log('Face AR запущен успешно');
        
        // Показываем кнопки управления
        document.getElementById('mindarFaceControls').style.display = 'flex';
        
        // Настраиваем логотип
        setupLogo();
        
        // Добавляем обработчик события обнаружения лица
        faceScene.addEventListener('targetFound', (e) => {
            console.log('Лицо обнаружено!', e);
        });
        
        faceScene.addEventListener('targetLost', (e) => {
            console.log('Лицо потеряно!', e);
        });
        
    } catch (e) {
        console.error('Ошибка запуска Face AR:', e);
    }
}

function setupLogo() {
    console.log('Настройка логотипа...');
    
    // Проверяем оба варианта логотипа
    const planeLogo = document.querySelector('#ar-scene-photo a-plane');
    const imageLogo = document.querySelector('#ar-scene-photo a-image');
    
    if (planeLogo) {
        console.log('Plane логотип найден');
        // Убеждаемся что материал загружен
        planeLogo.addEventListener('loaded', () => {
            console.log('Plane логотип загружен');
            planeLogo.setAttribute('visible', 'true');
        });
    }
    
    if (imageLogo) {
        console.log('Image логотип найден');
        imageLogo.addEventListener('loaded', () => {
            console.log('Image логотип загружен');
            imageLogo.setAttribute('visible', 'true');
        });
    }
    
    // Проверяем все anchor'ы
    const anchors = document.querySelectorAll('[mindar-face-target]');
    console.log('Найдено anchor-ов:', anchors.length);
    anchors.forEach((anchor, i) => {
        console.log(`Anchor ${i}:`, anchor.getAttribute('mindar-face-target'));
    });
}

// Закрыть AR
function closeMindarFace() {
    console.log('Закрытие Face AR...');
    
    if (faceARSystem) {
        try {
            faceARSystem.stop();
            faceARSystem = null;
        } catch (e) {
            console.log('Ошибка при остановке:', e);
        }
    }
    
    // Останавливаем видео поток
    const video = document.querySelector('#ar-scene-photo video');
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    document.getElementById('ar-scene-photo').classList.add('hidden');
    document.getElementById('mindarFaceControls').style.display = 'none';
    
    // Показываем пролог
    showPrologue();
}

// Сделать фото
function captureMindarSelfie() {
    const videoEl = document.querySelector('#ar-scene-photo video');
    const canvas = document.querySelector('#ar-scene-photo canvas');
    
    if (!videoEl || !canvas) {
        alert('Камера не готова');
        return;
    }
    
    // Создаём временный canvas для снимка
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = videoEl.videoWidth || 640;
    tempCanvas.height = videoEl.videoHeight || 480;
    const ctx = tempCanvas.getContext('2d');
    
    // Рисуем видео кадр
    ctx.drawImage(videoEl, 0, 0, tempCanvas.width, tempCanvas.height);
    
    // Рисуем 3D сцену поверх (если возможно)
    // Примечание: Three.js рендер в A-Frame не всегда легко захватить
    
    // Скачиваем изображение
    const link = document.createElement('a');
    link.download = 'museum-selfie-' + Date.now() + '.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
    
    console.log('Фото сохранено');
}

// ===== ПРИНУДИТЕЛЬНОЕ ИСПРАВЛЕНИЕ КНОПОК ШИФРА =====
// Этот код переопределяет все кнопки и гарантирует их работу

// Функция подсказки (если отсутствует)
if (typeof showCipherHint !== 'function') {
    window.showCipherHint = function(isExplicit = true) {
        const input = document.getElementById('cipherUserInput')?.value || '';
        for (let i = 0; i < cipherGameState.currentPhrase.length; i++) {
            if (i >= input.length || input[i] !== cipherGameState.currentPhrase[i]) {
                const targetLetter = cipherGameState.currentPhrase[i];
                const buttons = document.querySelectorAll('.cipher-letter-btn');
                buttons.forEach(btn => {
                    if (btn.textContent.toLowerCase() === targetLetter) {
                        btn.style.animation = 'pulse 0.5s ease infinite';
                        setTimeout(() => btn.style.animation = '', 2000);
                    }
                });
                break;
            }
        }
    };
}

// Дополнительно: переопределяем функцию проверки для надежности
const originalCheckCipherPhrase = checkCipherPhrase;
checkCipherPhrase = function() {
    console.log('Проверка фразы...');
    const userInput = document.getElementById('cipherUserInput')?.value || '';
    const normalizedInput = userInput.toLowerCase().replace(/\s+/g, '');
    const normalizedTarget = cipherGameState.currentPhrase.toLowerCase();
    
    if (normalizedInput === normalizedTarget) {
        showCipherWin();
    } else {
        const input = document.getElementById('cipherUserInput');
        input.style.borderColor = '#e74c3c';
        input.style.boxShadow = '0 0 10px rgba(231, 76, 60, 0.5)';
        setTimeout(() => {
            input.style.borderColor = '#c49a6c';
            input.style.boxShadow = 'none';
        }, 1000);
        
        // Показываем сколько букв правильно
        let correctCount = 0;
        for (let i = 0; i < Math.min(userInput.length, cipherGameState.currentPhrase.length); i++) {
            if (userInput[i] === cipherGameState.currentPhrase[i]) correctCount++;
        }
        alert(`Правильно: ${correctCount} из ${cipherGameState.currentPhrase.length} букв`);
    }
};

// Экспорт функций
window.startFinalQuest = startFinalQuest;
window.closeMindarFace = closeMindarFace;
window.captureMindarSelfie = captureMindarSelfie;

// Добавляем функции в глобальную область
window.startCipherQuest = startCipherQuest;
window.backFromCipher = backFromCipher;
window.restartCipherGame = restartCipherGame;

// Экспортируем функции для вызова из HTML
window.startFirstQuest = startFirstQuest;
window.closeSchoolContent = closeSchoolContent;
window.startVaseQuest = startVaseQuest;
window.startOrnamentQuest = startOrnamentQuest;
window.restartGame = restartGame;
window.backToMuseum = backToMuseum;
window.backFromOrnament = backFromOrnament;