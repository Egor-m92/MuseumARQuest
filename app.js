document.addEventListener("DOMContentLoaded", function() {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('prologue').classList.remove('hidden');
        animatePrologueText();
    }, 2500);

    const sceneEl = document.querySelector('a-scene');
    
    sceneEl.addEventListener('loaded', function () {
        setTimeout(() => {
            const target = document.querySelector('#example-target');
            
            if (target) {
                // Для предотвращения множественных открытий
                let isContentVisible = false;
                let timeoutId = null;
                
                target.addEventListener('targetFound', (event) => {
                    console.log('✅ Метка найдена');
                    
                    if (!isContentVisible) {
                        isContentVisible = true;
                        
                        // Показываем AR контент с задержкой (чтобы избежать мигания)
                        clearTimeout(timeoutId);
                        timeoutId = setTimeout(() => {
                            openARContent();
                        }, 500); // Задержка 500ms
                    }
                });
                
                target.addEventListener('targetLost', (event) => {
                    console.log('❌ Метка потеряна');
                    
                    // Автоматически скрывать при потере метки (опционально)
                    // timeoutId = setTimeout(() => {
                    //     if (isContentVisible) {
                    //         closeARContent();
                    //         isContentVisible = false;
                    //     }
                    // }, 2000);
                });
            }
        }, 1000);
    });
});

// Функции для управления AR контентом
function openARContent() {
    console.log('Открываем AR контент');
    
    // Скрываем другие элементы
    const prologue = document.getElementById('prologue');
    if (prologue && !prologue.classList.contains('hidden')) {
        prologue.classList.add('hidden');
    }
    
    // Показываем AR контент
    const arContent = document.getElementById('ar-content');
    if (arContent) {
        arContent.classList.remove('hidden');
        
        // Добавляем класс для анимации
        arContent.classList.add('visible');
    }
    
    // Останавливаем AR трекинг чтобы сохранить производительность
    const sceneEl = document.querySelector('a-scene');
    if (sceneEl && sceneEl.systems["mindar-image-system"]) {
        const arSystem = sceneEl.systems["mindar-image-system"];
        arSystem.stop();
    }
}

function closeARContent() {
    console.log('Закрываем AR контент');
    
    const arContent = document.getElementById('ar-content');
    if (arContent) {
        arContent.classList.add('hidden');
        arContent.classList.remove('visible');
    }
    
    // Возвращаемся к AR просмотру
    const sceneEl = document.querySelector('a-scene');
    if (sceneEl && sceneEl.systems["mindar-image-system"]) {
        const arSystem = sceneEl.systems["mindar-image-system"];
        arSystem.start();
    }
}

// Дополнительная функция для навигации
function showNextContent() {
    // Можно добавить смену контента внутри div
    const contentText = document.querySelector('.content-text');
    if (contentText) {
        contentText.innerHTML = `
            <h3>Архитектурные особенности</h3>
            <p>Здание представляет собой двухэтажное сооружение из красного кирпича...</p>
            
            <div class="facts">
                <div class="fact-item">
                    <span class="fact-icon">🧱</span>
                    <span>Материал: местный кирпич</span>
                </div>
                <div class="fact-item">
                    <span class="fact-icon">🪟</span>
                    <span>Арочные окна в готическом стиле</span>
                </div>
                <div class="fact-item">
                    <span class="fact-icon">🏗️</span>
                    <span>Общая площадь: 1200 м²</span>
                </div>
            </div>
            
            <button class="btn-primary" onclick="goBackToFirstContent()">Назад</button>
        `;
    }
}

function goBackToFirstContent() {
    const contentText = document.querySelector('.content-text');
    if (contentText) {
        contentText.innerHTML = `
            <h3>Историческая справка</h3>
            <p>Школа была построена в 1909 году по инициативе княгини Ирины Паскевич...</p>
            
            <div class="facts">
                <div class="fact-item">
                    <span class="fact-icon">🏛️</span>
                    <span>Архитектор: Иван Семёнов</span>
                </div>
                <div class="fact-item">
                    <span class="fact-icon">👥</span>
                    <span>Вместимость: 200 учеников</span>
                </div>
                <div class="fact-item">
                    <span class="fact-icon">📚</span>
                    <span>Первые предметы: чтение, письмо, арифметика</span>
                </div>
            </div>
            
            <button class="btn-primary" onclick="showNextContent()">Узнать больше</button>
        `;
    }
}

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

function startQuest(id_name_add, id_name_remove) {
    document.getElementById(id_name_add).classList.add('hidden');

    document.getElementById(id_name_remove).classList.remove('hidden');

    const sceneEl = document.querySelector('a-scene');
    if (sceneEl && sceneEl.systems["mindar-image-system"]) {
        const arSystem = sceneEl.systems["mindar-image-system"];
        arSystem.start();
    }
}

const btnPrimary = document.querySelector('.btn-primary');;
btnPrimary.addEventListener('click', () => {
    startQuest('prologue', 'ar-scene');
});

function closeMap() {
    document.getElementById('map-modal').classList.add('hidden');
}
