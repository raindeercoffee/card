// 卡片所有可以挑的選項。做卡片頁、收卡片頁都照這份;
// 雲端小程式(create-greeting-card)裡也有一份同樣的 id 清單,加選項時兩邊都要加。
window.CARD_OPTIONS = {
  // 封面版型(第一步先 3 種,之後加到 15 種)
  templates: [
    { id: 'lavender', name: '薰衣草小紙卡' },
    { id: 'envelope', name: '奶油信封' },
    { id: 'starry',   name: '夜空星星' },
  ],

  // 背景名畫:只用博物館標明「公共領域 / CC0」的圖
  // url = 大圖、thumb = 選擇時的小圖、credit = 卡片最下面的小字出處
  // 圖存在自己網站裡(直接跟博物館借圖會被它的防機器人關卡擋住);來源:芝加哥藝術博物館 IIIF
  //   painting-1 = artic.edu 作品 16568,painting-2 = 作品 16579
  paintings: [
    { id: 'none', name: '不要名畫' },
    { id: 'painting-1', name: '莫內《睡蓮》', url: 'assets/paintings/water-lilies.jpg', thumb: 'assets/paintings/water-lilies_s.jpg', credit: '莫內《睡蓮》(1906)· 芝加哥藝術博物館 · 公共領域' },
    { id: 'painting-2', name: '莫內《韋特伊》', url: 'assets/paintings/vetheuil.jpg', thumb: 'assets/paintings/vetheuil_s.jpg', credit: '莫內《韋特伊》(1901)· 芝加哥藝術博物館 · 公共領域' },
  ],

  // 音樂(小怪獸音樂工廠做的)
  music: [
    { id: 'gentle', name: '溫柔生日曲', note: '鋼琴+吉他,慢慢的', src: 'assets/music/gentle.mp3' },
    { id: 'shaker', name: 'Sol Mi Sol 沙鈴', note: '鋼琴+吉他+小沙鈴,輕快一點', src: 'assets/music/shaker.mp3' },
  ],

  // 結尾動畫。零件都是同一張畫布大小的透明 png,疊在一起剛好拼成完整的圖;
  // pivot = 那個零件轉動時的「軸心」(以畫布左上角為 0,0 的像素座標)
  endings: [
    {
      id: 'monster', name: '小怪獸揮手',
      canvas: [800, 800],
      parts: [
        { file: 'assets/endings/monster/body.png' },
        { file: 'assets/endings/monster/arm.png', move: 'wave', pivot: [560, 430] },
        { file: 'assets/endings/monster/eyes_closed.png', move: 'blink' },
      ],
    },
    {
      id: 'flowers', name: '花花草草',
      canvas: [1200, 600],
      parts: [
        { file: 'assets/endings/flowers/flower_1.png', move: 'sway', pivot: [300, 600] },
        { file: 'assets/endings/flowers/flower_2.png', move: 'sway', pivot: [600, 600], delay: 0.6 },
        { file: 'assets/endings/flowers/flower_3.png', move: 'sway', pivot: [900, 600], delay: 1.2 },
        { file: 'assets/endings/flowers/grass.png' },
      ],
    },
  ],

  // 封面大字的建議(也可以自己打)
  titleIdeas: ['生日快樂', '謝謝你', '想你了', '加油', '恭喜你', '我愛你'],
};
