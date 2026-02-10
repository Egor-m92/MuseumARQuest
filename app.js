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
            
            // Ждем загрузки сцены
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
            
            // Запускаем AR
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
            // Останавливаем AR
            arSystem.stop();
            currentARSystem = null;
            
            document.getElementById('ar-scene-school').classList.add('hidden');
            document.getElementById('ar-content-school').classList.remove('hidden');
        }

        function closeSchoolContent() {
            document.getElementById('ar-content-school').classList.add('hidden');
            document.getElementById('ar-scene-school').classList.remove('hidden');
            
            // Возобновляем AR
            const sceneEl = document.querySelector('#ar-scene-school a-scene');
            const arSystem = sceneEl.systems["mindar-image-system"];
            arSystem.start();
            currentARSystem = arSystem;
        }

        // ===== ВТОРОЙ КВЕСТ (ВАЗА) =====
        function startVaseQuest() {
            // Скрываем контент школы и сцену школы
            document.getElementById('ar-content-school').classList.add('hidden');
            document.getElementById('ar-scene-school').classList.add('hidden');
            
            // Останавливаем AR школы если еще работает
            if (currentARSystem) {
                currentARSystem.stop();
                currentARSystem = null;
            }
            
            // Показываем сцену для поиска вазы
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
                    // Останавливаем AR и запускаем игру
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
                
                setTimeout(() => {
                    createPuzzlePieces(img);
                }, 100);
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

                    const maxX = 250;
                    const maxY = 300;
                    piece.style.left = (15 + Math.random() * maxX) + 'px';
                    piece.style.top = (15 + Math.random() * maxY) + 'px';

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
            const maxX = 250;
            const maxY = 300;
            piece.style.left = (15 + Math.random() * maxX) + 'px';
            piece.style.top = (15 + Math.random() * maxY) + 'px';
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