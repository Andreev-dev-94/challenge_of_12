console.log('Yandex Games SDK Stub loaded');

window.YaGames = {
  init: function () {
    console.log('Yandex SDK initialized (stub)');

    // Инициализируем тестовые данные игрока в localStorage если их нет
    if (!localStorage.getItem('yandex_test_player_id')) {
      localStorage.setItem('yandex_test_player_id', 'test_user_' + Date.now());
      localStorage.setItem('yandex_test_player_name', 'Test Player');
    }

    return Promise.resolve({
      // Игрок
      getPlayer: function () {
        return Promise.resolve({
          getUniqueID: function () {
            return Promise.resolve(localStorage.getItem('yandex_test_player_id') || 'test_user_' + Date.now());
          },
          getName: function () {
            return Promise.resolve(localStorage.getItem('yandex_test_player_name') || 'Test Player');
          },
          getPhoto: function () {
            return Promise.resolve('small');
          },
          getMode: function () {
            return Promise.resolve('lite');
          },
          getIDsPerGame: function () {
            return Promise.resolve([]);
          }
        });
      },

      // Реклама
      adv: {
        showFullscreenAdv: function (params) {
          console.log('Fullscreen ad would be shown now', params);

          // Эмулируем поведение рекламы
          if (params && params.callbacks) {
            // Вызываем onOpen сразу
            setTimeout(() => {
              if (params.callbacks.onOpen) params.callbacks.onOpen();

              // Эмулируем закрытие рекламы через 2 секунды
              setTimeout(() => {
                if (params.callbacks.onClose) params.callbacks.onClose(true);
              }, 2000);
            }, 100);
          }

          return Promise.resolve();
        },

        showRewardedVideo: function (params) {
          console.log('Rewarded video would be shown now', params);

          if (params && params.callbacks) {
            setTimeout(() => {
              if (params.callbacks.onOpen) params.callbacks.onOpen();

              setTimeout(() => {
                // Эмулируем успешный просмотр
                if (params.callbacks.onRewarded) params.callbacks.onRewarded();
                if (params.callbacks.onClose) params.callbacks.onClose(true);
              }, 3000);
            }, 100);
          }

          return Promise.resolve();
        },

        showBannerAdv: function () {
          console.log('Banner ad would be shown now');
          return Promise.resolve();
        },

        hideBannerAdv: function () {
          console.log('Banner ad would be hidden now');
          return Promise.resolve();
        }
      },

      // Лидерборды
      getLeaderboards: function () {
        console.log('Getting leaderboards API');
        return Promise.resolve({
          setLeaderboardScore: function (leaderboardName, score, extraData = null) {
            console.log(`Setting leaderboard score: ${leaderboardName} = ${score}`, extraData);

            // Получаем текущие данные лидерборда из localStorage
            const leaderboardData = JSON.parse(localStorage.getItem(`yandex_leaderboard_${leaderboardName}`) || '[]');

            // Получаем "текущего игрока" из localStorage
            const currentPlayer = {
              uniqueID: localStorage.getItem('yandex_test_player_id') || 'test_user_' + Date.now(),
              name: localStorage.getItem('yandex_test_player_name') || 'Test Player',
              photo: 'small'
            };

            // Добавляем или обновляем результат
            const existingIndex = leaderboardData.findIndex(entry => entry.uniqueID === currentPlayer.uniqueID);

            if (existingIndex >= 0) {
              // ВАЖНО: Всегда обновляем результат, даже если новый хуже
              leaderboardData[existingIndex].score = score;
              leaderboardData[existingIndex].extraData = extraData;
              leaderboardData[existingIndex].timestamp = Date.now();
              console.log(`Updated score for player ${currentPlayer.name}: ${score}`);
            } else {
              // Добавляем нового игрока
              leaderboardData.push({
                uniqueID: currentPlayer.uniqueID,
                name: currentPlayer.name,
                score: score,
                extraData: extraData,
                timestamp: Date.now(),
                rank: 0 // Будет вычислен при получении
              });
              console.log(`Added new player ${currentPlayer.name} with score: ${score}`);
            }

            // Сортируем по убыванию очков
            leaderboardData.sort((a, b) => b.score - a.score);

            // Обновляем ранги
            leaderboardData.forEach((entry, index) => {
              entry.rank = index + 1;
            });

            // Сохраняем в localStorage
            localStorage.setItem(`yandex_leaderboard_${leaderboardName}`, JSON.stringify(leaderboardData));

            console.log('Leaderboard score saved locally');
            return Promise.resolve();
          },

          getLeaderboardEntries: function (leaderboardName, options = {}) {
            console.log(`Getting leaderboard entries for: ${leaderboardName}`, options);

            // Получаем данные из localStorage
            const leaderboardData = JSON.parse(localStorage.getItem(`yandex_leaderboard_${leaderboardName}`) || '[]');

            // Получаем ID текущего игрока
            const currentPlayerID = localStorage.getItem('yandex_test_player_id') || 'test_user_' + Date.now();

            // Если данных нет, создаем демо-данные
            if (leaderboardData.length === 0) {
              console.log('No leaderboard data found, creating demo data');

              // Создаем демо-данные с разными игроками
              const demoPlayers = [
                { name: 'Champion', score: 15000 },
                { name: 'ProPlayer', score: 12000 },
                { name: 'Gamer', score: 9000 },
                { name: 'Newbie', score: 5000 },
                { name: 'Beginner', score: 2000 }
              ];

              demoPlayers.forEach((player, index) => {
                leaderboardData.push({
                  uniqueID: `demo_player_${index}`,
                  name: player.name,
                  score: player.score,
                  extraData: null,
                  timestamp: Date.now() - (index * 86400000), // Разные даты
                  rank: index + 1
                });
              });

              // Добавляем текущего игрока в середину для демонстрации
              leaderboardData.push({
                uniqueID: currentPlayerID,
                name: localStorage.getItem('yandex_test_player_name') || 'Test Player',
                score: 0,
                extraData: null,
                timestamp: Date.now(),
                /* rank: 4 */
              });

              // Сортируем заново
              leaderboardData.sort((a, b) => b.score - a.score);
              leaderboardData.forEach((entry, index) => {
                entry.rank = index + 1;
              });

              localStorage.setItem(`yandex_leaderboard_${leaderboardName}`, JSON.stringify(leaderboardData));
            }

            // Применяем пагинацию (если указана)
            let resultData = [...leaderboardData]; // Копируем массив
            if (options.quantity) {
              resultData = leaderboardData.slice(0, options.quantity);
            }

            // Находим текущего пользователя в таблице
            const playerEntry = leaderboardData.find(entry => entry.uniqueID === currentPlayerID);
            const userRank = playerEntry ? playerEntry.rank : 0;

            console.log(`Leaderboard data retrieved: ${resultData.length} entries, user rank: ${userRank}`);

            return Promise.resolve({
              leaderboard: {
                name: leaderboardName,
                description: 'Top players',
                // ... другие свойства лидерборда
              },
              ranges: [
                {
                  start: 1,
                  size: leaderboardData.length
                }
              ],
              userRank: userRank,
              entries: resultData
            });
          }
        });
      },

      // Другие возможности SDK
      features: {
        LoadingAPI: {
          ready: function () {
            console.log('LoadingAPI.ready() called');
            return Promise.resolve();
          }
        }
      },

      // Окружение
      environment: {
        getPayload: function () {
          return Promise.resolve(null);
        }
      },

      // Платежи (если понадобятся в будущем)
      payments: {
        getPurchases: function () {
          return Promise.resolve([]);
        },
        purchase: function () {
          return Promise.reject(new Error('Payments not available in stub'));
        }
      },

      // Сохранения (если понадобятся в будущем)
      storage: {
        getItem: function (key) {
          return Promise.resolve(localStorage.getItem(key));
        },
        setItem: function (key, value) {
          localStorage.setItem(key, value);
          return Promise.resolve();
        },
        removeItem: function (key) {
          localStorage.removeItem(key);
          return Promise.resolve();
        }
      },

      // Короткая вибрация (для мобильных устройств)
      device: {
        vibrate: function (pattern) {
          console.log('Vibration would be triggered:', pattern);
          return Promise.resolve();
        }
      },

      // Достижения (если понадобятся в будущем)
      achievements: {
        open: function () {
          console.log('Achievements window would be opened');
          return Promise.resolve();
        }
      }
    });
  }
};

// Автоматическая инициализация для удобства тестирования
window.addEventListener('load', function () {
  console.log('Page loaded, auto-initializing Yandex SDK stub...');
  if (window.YaGames) {
    window.YaGames.init().then(function (ysdk) {
      console.log('✅ Yandex SDK stub initialized successfully');
      window.ysdk = ysdk;
    }).catch(function (error) {
      console.error('❌ Failed to initialize Yandex SDK stub:', error);
    });
  }
});

console.log('Yandex Games SDK Stub setup complete');