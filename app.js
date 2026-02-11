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
    gridSize: 25,
    cellSize: 0,
    playerGrid: [],
    targetGrid: [],
    targetCells: [
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
    ],
    gameCompleted: false,
    canvas: null,
    ctx: null,
    canvasSize: 0
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('prologue').classList.remove('hidden');
        animatePrologueText();
    }, 2500);
});

// ===== ПРОЛОГ =====
function animatePrologueText() {
    const text = document.getElementById('prologue-text');
    const originalText = text.textContent;
    text.textContent = '';
    
    let i = 0;
    const interval = setInterval(() => {
        text.textContent += originalText[i];
        i++;
        if (i >= originalText.length) {
            clearInterval(interval);
        }
    }, 30);
}

// ===== ПЕРВЫЙ КВЕСТ (ШКОЛА) =====
function startFirstQuest() {
    document.getElementById('prologue').classList.add('hidden');
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
    
    target.addEventListener('targetLost', () => {
        console.log('School target lost');
    });
}

function showSchoolContent(arSystem) {
    arSystem.stop();
    currentARSystem = null;
    
    document.getElementById('ar-scene-school').classList.add('hidden');
    document.getElementById('ar-content-school').classList.remove('hidden');
}

function closeSchoolContent() {
    document.getElementById('ar-content-school').classList.add('hidden');
    document.getElementById('ar-scene-school').classList.remove('hidden');
    
    const sceneEl = document.querySelector('#ar-scene-school a-scene');
    const arSystem = sceneEl.systems["mindar-image-system"];
    arSystem.start();
    currentARSystem = arSystem;
}

// ===== ВТОРОЙ КВЕСТ (ВАЗА) =====
function startVaseQuest() {
    document.getElementById('ar-content-school').classList.add('hidden');
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
    
    target.addEventListener('targetLost', () => {
        console.log('Vase target lost');
    });
}

// ===== ТРЕТИЙ КВЕСТ (ОРНАМЕНТ) =====
function startOrnamentQuest() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('winMessage').style.display = 'none';
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
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
            startOrnamentGame();
        }
    });
    
    target.addEventListener('targetLost', () => {
        console.log('Ornament target lost');
    });
}

// ===== ИГРА С ВАЗОЙ =====
function startGame() {
    document.getElementById('game-screen').classList.remove('hidden');
    initGame();
}

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

    const isOverVase = 
        pieceRect.left >= vaseRect.left - 100 &&
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
    document.getElementById('winMessage').style.display = 'block';
    vaseImage.style.opacity = '1';
}

function restartGame() {
    document.getElementById('winMessage').style.display = 'none';
    initGame();
}

function backToMuseum() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('winMessage').style.display = 'none';
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    document.getElementById('prologue').classList.remove('hidden');
}

// ===== ИГРА С ОРНАМЕНТОМ =====
const ornamentGame = {
    init: function() {
        this.canvas = document.getElementById('ornamentCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.updateCanvasSize();
        
        // Инициализация сеток
        const totalCells = ornamentGameState.gridSize * ornamentGameState.gridSize;
        ornamentGameState.playerGrid = Array(totalCells).fill(false);
        ornamentGameState.targetGrid = Array(totalCells).fill(false);
        
        // Установка целевых ячеек
        ornamentGameState.targetCells.forEach(index => {
            if (index >= 0 && index < totalCells) {
                ornamentGameState.targetGrid[index] = true;
            }
        });
        
        // Обработчики событий
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('click', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        }, {passive: false});
        
        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.updateCanvasSize();
                this.draw();
            }, 250);
        });
        
        this.updateUI();
        this.draw();
    },
    
    updateCanvasSize: function() {
        const isMobile = window.innerWidth <= 768;
        const maxSize = Math.min(window.innerWidth - 40, 500);
        const size = isMobile ? Math.min(maxSize, 350) : 350;
        
        ornamentGameState.canvasSize = size;
        this.canvas.width = size;
        this.canvas.height = size;
        ornamentGameState.cellSize = size / ornamentGameState.gridSize;
    },
    
    draw: function() {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        const size = ornamentGameState.canvasSize;
        const cellSize = ornamentGameState.cellSize;
        const gridSize = ornamentGameState.gridSize;
        
        // Очистка холста
        ctx.clearRect(0, 0, size, size);
        
        // Белый фон
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        
        // Рисуем целевой паттерн (полупрозрачный фон)
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#00d4ff';
        for (let i = 0; i < ornamentGameState.targetGrid.length; i++) {
            if (ornamentGameState.targetGrid[i]) {
                const row = Math.floor(i / gridSize);
                const col = i % gridSize;
                ctx.fillRect(col * cellSize + 1, row * cellSize + 1, cellSize - 2, cellSize - 2);
            }
        }
        ctx.globalAlpha = 1.0;
        
        // Рисуем закрашенные ячейки игрока
        ctx.fillStyle = '#00d4ff';
        for (let i = 0; i < ornamentGameState.playerGrid.length; i++) {
            if (ornamentGameState.playerGrid[i]) {
                const row = Math.floor(i / gridSize);
                const col = i % gridSize;
                ctx.fillRect(col * cellSize + 2, row * cellSize + 2, cellSize - 4, cellSize - 4);
            }
        }
        
        // Рисуем сетку
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= gridSize; i++) {
            const pos = i * cellSize;
            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, size);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(size, pos);
            ctx.stroke();
        }
    },
    
    handleClick: function(e) {
        if (ornamentGameState.gameCompleted) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        const col = Math.floor(x / ornamentGameState.cellSize);
        const row = Math.floor(y / ornamentGameState.cellSize);
        
        if (col >= 0 && col < ornamentGameState.gridSize && row >= 0 && row < ornamentGameState.gridSize) {
            const index = row * ornamentGameState.gridSize + col;
            ornamentGameState.playerGrid[index] = !ornamentGameState.playerGrid[index];
            this.updateUI();
            this.draw();
        }
    },
    
    updateUI: function() {
        const filled = ornamentGameState.playerGrid.filter(cell => cell).length;
        const total = ornamentGameState.targetCells.length;
        
        document.getElementById('ornamentFilled').textContent = filled;
        document.getElementById('ornamentTotal').textContent = total;
        
        if (ornamentGameState.gameCompleted) {
            document.getElementById('ornamentStatus').textContent = 'Завершено!';
            document.getElementById('ornamentStatus').style.color = '#27ae60';
        } else {
            document.getElementById('ornamentStatus').textContent = 'В процессе';
            document.getElementById('ornamentStatus').style.color = '#f1c40f';
        }
    },
    
    check: function() {
        // Проверяем, что все целевые ячейки закрашены
        let correct = true;
        for (let i = 0; i < ornamentGameState.targetGrid.length; i++) {
            if (ornamentGameState.targetGrid[i] && !ornamentGameState.playerGrid[i]) {
                correct = false;
                break;
            }
        }
        
        // Проверяем, что нет лишних закрашенных ячеек
        let extraCells = 0;
        for (let i = 0; i < ornamentGameState.playerGrid.length; i++) {
            if (ornamentGameState.playerGrid[i] && !ornamentGameState.targetGrid[i]) {
                extraCells++;
            }
        }
        
        if (correct && extraCells === 0) {
            ornamentGameState.gameCompleted = true;
            this.updateUI();
            this.showWin();
        } else {
            const statusEl = document.getElementById('ornamentStatus');
            const originalText = statusEl.textContent;
            const originalColor = statusEl.style.color;
            
            statusEl.textContent = 'Неверно!';
            statusEl.style.color = '#e74c3c';
            
            setTimeout(() => {
                statusEl.textContent = originalText;
                statusEl.style.color = originalColor;
            }, 1500);
        }
    },
    
    hint: function() {
        if (ornamentGameState.gameCompleted) return;
        
        // Находим первую незакрашенную целевую ячейку
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
            const cellSize = ornamentGameState.cellSize;
            
            // Мигание подсказки
            let blinkCount = 0;
            const blinkInterval = setInterval(() => {
                this.draw();
                
                if (blinkCount % 2 === 0) {
                    this.ctx.fillStyle = 'rgba(241, 196, 15, 0.6)';
                    this.ctx.fillRect(col * cellSize + 2, row * cellSize + 2, cellSize - 4, cellSize - 4);
                }
                
                blinkCount++;
                if (blinkCount > 6) {
                    clearInterval(blinkInterval);
                    this.draw();
                }
            }, 300);
        }
    },
    
    clear: function() {
        ornamentGameState.playerGrid = Array(ornamentGameState.gridSize * ornamentGameState.gridSize).fill(false);
        ornamentGameState.gameCompleted = false;
        this.updateUI();
        this.draw();
    },
    
    restart: function() {
        document.getElementById('ornamentWinMessage').style.display = 'none';
        this.clear();
    },
    
    showWin: function() {
        document.getElementById('ornamentAccuracy').textContent = '100%';
        document.getElementById('ornamentWinMessage').style.display = 'flex';
    }
};

function startOrnamentGame() {
    document.getElementById('ornament-game-screen').classList.remove('hidden');
    ornamentGame.init();
}

function backToMuseumFromOrnament() {
    document.getElementById('ornament-game-screen').classList.add('hidden');
    document.getElementById('ornamentWinMessage').style.display = 'none';
    document.getElementById('prologue').classList.remove('hidden');
}

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