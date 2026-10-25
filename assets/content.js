// 作品内容集中在这里维护。数组顺序即全部作品的展示顺序。
// featured: true 表示精选作品；id 请保持唯一，新增作品时可自行命名。
window.portfolioContent = {
    heroImage: "images/feitu.png",
    email: "1917643166@qq.com",
    emailService: { publicKey: "EhaQ_NO-8EqCeSR0R", serviceId: "service_tqhetdc", templateId: "template_fto6u5d" },
    counters: [
        { target: 3, label: "年经验" },
        { target: 12, label: "完成项目" },
        { target: 9, label: "掌握软件" },
        { target: 5000, label: "创作小时" }
    ],
    projects: [
    {
        "id": "community-court",
        "featured": true,
        "title": "社区球场",
        "category": "场景",
        "thumb": "images/portfolio-2026/community-court/morning-fog.png",
        "desc": "病毒灾难过后，人类仓皇离开，植被逐渐重新占据社区球场。通过晨雾与日光两套光照，呈现同一场景的不同氛围。\n\n个人工作涵盖白盒与主视角构图、建筑及场景资产整合、植被布置和光照调整。自主制作墙体、门窗、卷帘门、围网等模块化部件，使用 SpeedTree 与 UE5 插件制作植被，使用 Substance 3D Designer 制作围网、砖墙和混凝土的四方连续贴图，并在 UE5 中通过材质混合与顶点绘制添加青苔。\n\n部分道具使用 AI 模型与外部素材，个人贡献为素材选择、场景摆放及整体环境整合。相册中的素材展示图已单独标明来源范围。",
        "videoUrl": "",
        "documents": [],
        "meta": [
            {
                "label": "工具",
                "value": "UE5 / SpeedTree / Substance 3D Designer"
            },
            {
                "label": "制作周期",
                "value": "18 天"
            },
            {
                "label": "时间",
                "value": "2026"
            }
        ],
        "gallery": [
            "images/portfolio-2026/community-court/morning-fog.png",
            "images/portfolio-2026/community-court/daylight.png",
            "images/portfolio-2026/community-court/wall-and-vegetation.png",
            "images/portfolio-2026/community-court/street-and-fence.png",
            "images/portfolio-2026/community-court/blockout.png",
            "images/portfolio-2026/community-court/first-assembly.png",
            "images/portfolio-2026/community-court/environment-detail.png",
            "images/portfolio-2026/community-court/atmosphere.png",
            "images/portfolio-2026/community-court/modular-assets.png",
            "images/portfolio-2026/community-court/integrated-assets.png",
            "images/portfolio-2026/community-court/vegetation-assets.png",
            "images/portfolio-2026/community-court/designer-materials.png"
        ],
        "galleryCaptions": {
            "images/portfolio-2026/community-court/morning-fog.png": "最终效果 · 晨雾",
            "images/portfolio-2026/community-court/daylight.png": "同场景光照版本 · 日光",
            "images/portfolio-2026/community-court/wall-and-vegetation.png": "实机细节 · 高墙、藤蔓与地表植被",
            "images/portfolio-2026/community-court/street-and-fence.png": "实机细节 · 沿街建筑、卷帘门与围网",
            "images/portfolio-2026/community-court/blockout.png": "迭代 01 · 白盒体块、场地关系与主视角构图",
            "images/portfolio-2026/community-court/first-assembly.png": "迭代 02 · 建筑资产、基础地面与植被搭建",
            "images/portfolio-2026/community-court/environment-detail.png": "迭代 03 · 墙面藤蔓、地表细节与植被完善",
            "images/portfolio-2026/community-court/atmosphere.png": "迭代 04 · 光照、雾气与画面色彩调整",
            "images/portfolio-2026/community-court/modular-assets.png": "自主制作 · 墙体、门窗、卷帘门及围网模块",
            "images/portfolio-2026/community-court/integrated-assets.png": "AI 模型与外部素材 · 个人工作为素材整合与场景应用",
            "images/portfolio-2026/community-court/vegetation-assets.png": "自主制作 · 使用 UE5 插件与 SpeedTree 制作并布置植被",
            "images/portfolio-2026/community-court/designer-materials.png": "自主制作 · Substance 3D Designer 围网、砖墙与混凝土材质"
        }
    },
    {
        "id": "ghost-of-tsushima",
        "featured": true,
        "title": "对马岛之魂",
        "category": "场景",
        "thumb": "images/portfolio-2026/ghost-of-tsushima/final.png",
        "desc": "以战后的日本为背景，营造萧条中仍透出希望的室外环境。阴云、远处建筑与水面共同构成主视角的空间层次。\n\n作品集展示了从体块白盒、灰模到场景搭建与光照调整的迭代过程，并附有建筑资产展示。",
        "videoUrl": "",
        "documents": [],
        "meta": [
            {
                "label": "工具",
                "value": "Unreal Engine 5"
            },
            {
                "label": "方向",
                "value": "场景美术 / 地编 / 灯光"
            },
            {
                "label": "时间",
                "value": "2026"
            }
        ],
        "gallery": [
            "images/portfolio-2026/ghost-of-tsushima/final.png",
            "images/portfolio-2026/ghost-of-tsushima/blockout-01.png",
            "images/portfolio-2026/ghost-of-tsushima/blockout-02.png",
            "images/portfolio-2026/ghost-of-tsushima/greybox.png",
            "images/portfolio-2026/ghost-of-tsushima/first-lighting.png",
            "images/portfolio-2026/ghost-of-tsushima/environment-iteration.png",
            "images/portfolio-2026/ghost-of-tsushima/architecture-assets.png"
        ],
        "galleryCaptions": {
            "images/portfolio-2026/ghost-of-tsushima/final.png": "最终效果 · 室外场景与光照氛围",
            "images/portfolio-2026/ghost-of-tsushima/blockout-01.png": "白盒探索 · 初始体块与视角",
            "images/portfolio-2026/ghost-of-tsushima/blockout-02.png": "白盒迭代 · 场地尺度与构图调整",
            "images/portfolio-2026/ghost-of-tsushima/greybox.png": "灰模阶段 · 建筑与场景结构",
            "images/portfolio-2026/ghost-of-tsushima/first-lighting.png": "场景迭代 · 资产搭建与初步光照",
            "images/portfolio-2026/ghost-of-tsushima/environment-iteration.png": "场景迭代 · 环境细节与氛围调整",
            "images/portfolio-2026/ghost-of-tsushima/architecture-assets.png": "建筑资产展示"
        }
    },
    {
        "id": "peach-garden",
        "featured": true,
        "title": "桃园",
        "category": "场景",
        "thumb": "images/portfolio-2026/peach-garden/final.jpg",
        "desc": "以水面、桃树和室外建筑构成桃园场景，通过日光照明呈现明亮的自然环境。\n\n从白盒与尺度确认开始，逐步搭建环境资产，再调整灯光与整体氛围。相册保留了三个主要制作阶段。",
        "videoUrl": "",
        "documents": [],
        "meta": [
            {
                "label": "工具",
                "value": "Unreal Engine 5"
            },
            {
                "label": "制作周期",
                "value": "12 天"
            },
            {
                "label": "时间",
                "value": "2026"
            }
        ],
        "gallery": [
            "images/portfolio-2026/peach-garden/final.jpg",
            "images/portfolio-2026/peach-garden/blockout.jpg",
            "images/portfolio-2026/peach-garden/environment.jpg",
            "images/portfolio-2026/peach-garden/lighting.jpg"
        ],
        "galleryCaptions": {
            "images/portfolio-2026/peach-garden/final.jpg": "最终效果 · 室外桃园与日光照明",
            "images/portfolio-2026/peach-garden/blockout.jpg": "制作阶段 01 · 白盒与尺度",
            "images/portfolio-2026/peach-garden/environment.jpg": "制作阶段 02 · 环境资产搭建",
            "images/portfolio-2026/peach-garden/lighting.jpg": "制作阶段 03 · 灯光与氛围"
        }
    },
    {
        "id": "church-tod",
        "featured": false,
        "title": "教堂 TOD",
        "category": "灯光专项",
        "thumb": "images/portfolio-2026/church-tod/sacred.png",
        "desc": "在同一教堂场景中使用 UE5 制作两套灯光方案，探索光照对空间情绪的影响。\n\n“神圣”版本以窗外透入的暖光强调纵深与仪式感，“诡异”版本使用红绿光照塑造幽暗氛围。",
        "videoUrl": "",
        "documents": [],
        "meta": [
            {
                "label": "工具",
                "value": "Unreal Engine 5"
            },
            {
                "label": "制作周期",
                "value": "2 天"
            },
            {
                "label": "时间",
                "value": "2026"
            }
        ],
        "gallery": [
            "images/portfolio-2026/church-tod/sacred.png",
            "images/portfolio-2026/church-tod/eerie.png"
        ],
        "galleryCaptions": {
            "images/portfolio-2026/church-tod/sacred.png": "灯光方案 · 神圣",
            "images/portfolio-2026/church-tod/eerie.png": "灯光方案 · 诡异"
        }
    },
    {
        "id": "wartime-street",
        "featured": false,
        "title": "二战 · 战时街道",
        "category": "灯光专项",
        "thumb": "images/portfolio-2026/wartime-street/final.jpg",
        "desc": "围绕二战街道进行灯光氛围探索，以场景构图、冷暖光照和氛围重塑组织画面。\n\n阴天版本使用火光点缀，用于 CG 宣发氛围展示；晨曦版本强调冷暖关系与写实效果，用于实机展示。相册同时收录战时街道的完整构图。",
        "videoUrl": "",
        "documents": [],
        "meta": [
            {
                "label": "工具",
                "value": "Unreal Engine 5"
            },
            {
                "label": "制作周期",
                "value": "3 天"
            },
            {
                "label": "时间",
                "value": "2026"
            }
        ],
        "gallery": [
            "images/portfolio-2026/wartime-street/final.jpg",
            "images/portfolio-2026/wartime-street/overcast.jpg",
            "images/portfolio-2026/wartime-street/dawn.jpg"
        ],
        "galleryCaptions": {
            "images/portfolio-2026/wartime-street/final.jpg": "战时街道 · 完整构图与冷暖光照",
            "images/portfolio-2026/wartime-street/overcast.jpg": "阴天 / 火光点缀 · CG 宣发氛围",
            "images/portfolio-2026/wartime-street/dawn.jpg": "晨曦 / 冷暖写实 · 实机展示"
        }
    },
    {
        "id": "lakeside-cabin",
        "featured": false,
        "title": "湖畔小屋",
        "category": "灯光专项",
        "thumb": "images/portfolio-2026/lakeside-cabin/golden-hour.jpg",
        "desc": "以湖畔小屋和码头为叙事中心，探索黄金时刻的自然环境光照。暖色光线与远山、水面的柔和层次共同塑造安静的湖畔氛围。",
        "videoUrl": "",
        "documents": [],
        "meta": [
            {
                "label": "工具",
                "value": "Unreal Engine 5"
            },
            {
                "label": "方向",
                "value": "场景叙事 / 黄金时刻 / 自然环境"
            },
            {
                "label": "时间",
                "value": "2026"
            }
        ],
        "gallery": [
            "images/portfolio-2026/lakeside-cabin/golden-hour.jpg"
        ],
        "galleryCaptions": {
            "images/portfolio-2026/lakeside-cabin/golden-hour.jpg": "最终效果 · 黄金时刻的湖畔小屋"
        }
    },
    {
        id: "cute-room",
        featured: true,
        title: "Cute Room",
        category: "场景",
        thumb: "images/CuteRoom.png",
        desc: "一个温馨可爱的房间场景，融合了低多边形风格与柔和的灯光设计，风格化材质，营造出治愈系的视觉体验。\n\n场景中每一个物件都经过精心布局，从家具的圆润造型到墙面的暖色调，都旨在传达一种宁静、舒适的生活氛围。",
        hasVideo: false,
        videoUrl: "",
        hasDoc: false,
        documents: [],
        meta: [
            { label: "工具", value: "Blender + Substance Painter" },
            { label: "时间", value: "2024" }
        ],
        gallery: ["images/CuteRoom.png"]
    },
    {
        id: "mysterious-factory",
        title: "神秘工厂",
        category: "概念设计与创意",
        thumb: "images/神秘工厂CUBE.png",
        desc: "一座隐藏在废土深处的神秘工业设施，充满了锈蚀的金属管道、斑驳的混凝土墙面和忽明忽灭的警示灯光。\n\n项目重点探索了 PBR 材质在工业废墟场景中的应用，通过大量细节堆砌来营造末世感与压迫感。",
        hasVideo: false,
        videoUrl: "",
        hasDoc: false,
        documents: [],
        meta: [
            { label: "工具", value: "Unreal Engine 5 + ZBrush" },
            { label: "时间", value: "2024" }
        ],
        gallery: ["images/神秘工厂CUBE.png"]
    },
    {
        id: "wasteland",
        featured: true,
        title: "废土",
        category: "场景",
        thumb: "images/feitu.png",
        desc: "末日来临，主角找到了最后的人类聚集地。\n\n项目重点探索了 PBR 材质，光影和气氛，资产选用，火焰粒子，通过大量细节堆砌来营造氛围。",
        hasVideo: false,
        videoUrl: "",
        hasDoc: false,
        documents: [],
        meta: [
            { label: "工具", value: "Unreal Engine 5 +FAB" },
            { label: "时间", value: "2025" }
        ],
        gallery: ["images/feitu.png"]
    },
    {
        id: "wheelchair-corridor",
        featured: true,
        title: "轮椅走廊",
        category: "场景",
        thumb: "images/RE9_1.png",
        desc: "BlenderSP流程制作资产，使用UE5烘焙灯光，含实机演示，探索类RE9氛围。",
        hasVideo: true,
        videoUrl: "https://www.bilibili.com/video/BV1DuVL6bEcA/?spm_id_from=333.337.search-card.all.click&vd_source=d593d2a5fe15156ff54df2f13d22acec",
        hasDoc: false,
        documents: [],
        meta: [
            { label: "工具", value: "UE BLENDER SP" },
            { label: "时间", value: "2026" }
        ],
        gallery: ["images/RE9_1.png", "images/RE9_2.png", "images/RE9_3.png"]
    },
    {
        id: "longboard",
        title: "长板",
        category: "模型",
        thumb: "images/长板2.png",
        desc: "手工制作的长板滑板模型，从选材到成型的完整制作过程。\n\n包含详细的制作文档，记录了从木材切割、打磨到最终成品的每一个步骤。",
        hasVideo: false,
        videoUrl: "",
        hasDoc: true,
        documents: [
            { name: "长板制作文档", url: "docs/长板制作文档.docx", type: "docx" }
        ],
        meta: [
            { label: "工具", value: "Blender+SP" },
            { label: "时间", value: "2026" }
        ],
        gallery: ["images/长板2.png", "images/长板1.png"]
    },
    {
        id: "construction-lighting",
        title: "工地",
        category: "灯光专项",
        thumb: "images/light/fps/1.png",
        desc: "一个废弃工地场景，模拟室内灯光环境。使用UE5 Lumen实时全局光照与反射，结合后期处理营造紧张刺激的FPS游戏环境。",
        hasVideo: false,
        videoUrl: "",
        hasDoc: false,
        documents: [],
        meta: [
            { label: "工具", value: "UE5 Lumen" },
            { label: "时间", value: "2026.6" }
        ],
        gallery: ["images/light/fps/1.png", "images/light/fps/2.png"]
    },
    {
        id: "dungeon",
        title: "地牢",
        category: "场景",
        thumb: "images/DILAO/1.png",
        desc: "一个地牢场景与灯光设计 全流程烘焙光照",
        hasVideo: false,
        videoUrl: "",
        hasDoc: false,
        documents: [],
        meta: [
            { label: "工具", value: "Blender UE5" },
            { label: "时间", value: "2026.7" }
        ],
        gallery: ["images/DILAO/2.png", "images/DILAO/3.png"]
    },
    {
        id: "substance-notes",
        title: "个人思路与文档整理",
        category: "SD专项",
        thumb: "images/sd-icon.svg",
        desc: "个人SD学习过程中的思路整理与参考资料汇总。",
        hasVideo: false,
        videoUrl: "",
        hasDoc: true,
        documents: [
            { name: "SD_Class01 笔记", url: "docs/SD/SD_class01.pdf", type: "pdf" }
        ],
        meta: [
            { label: "工具", value: "Substance Designer" }
        ],
        gallery: []
    },
    {
        id: "cyber-city",
        title: "赛博城市",
        category: "概念设计与创意",
        thumb: "images/GN/cyb.png",
        desc: "赛博朋克风格城市概念设计，霓虹灯光与未来都市氛围的视觉探索。",
        hasVideo: false,
        videoUrl: "",
        hasDoc: false,
        documents: [],
        meta: [
            { label: "工具", value: "Blender" },
            { label: "时间", value: "2026.7" }
        ],
        gallery: []
    },
    {
        id: "lighting-notes",
        title: "灯光学习笔记",
        category: "灯光专项",
        thumb: "images/ue-icon.svg",
        desc: "UE灯光学习过程中的笔记与设置参考，涵盖GPU Lightmass参数、场景布光思路等内容。",
        hasVideo: false,
        videoUrl: "",
        hasDoc: true,
        documents: [
            { name: "GPU Lightmass设置", url: "docs/灯光学习笔记/GPU Lightmass设置.png", type: "image" },
            { name: "我的Lightmass设置", url: "docs/灯光学习笔记/我的Lightmass设置.png", type: "image" },
            { name: "灯光笔记", url: "docs/灯光学习笔记/灯光笔记.docx", type: "docx" }
        ],
        meta: [
            { label: "工具", value: "Unreal Engine" },
            { label: "时间", value: "2026.7" }
        ],
        gallery: []
    }
]
};
