# **9\. Source Tree**

ar-drone-controller/  
├── packages/  
│   ├── api/  
│   │   ├── src/  
│   │   │   └── index.ts      \# Main backend server entry point  
│   │   ├── package.json  
│   │   └── tsconfig.json  
│   │  
│   └── web/  
│       ├── src/  
│       │   ├── components/   \# React components (e.g., VideoPlayer, Controls)  
│       │   ├── hooks/        \# Custom React hooks (e.g., useDroneSocket)  
│       │   ├── App.tsx       \# Main React application component  
│       │   └── main.tsx      \# Frontend application entry point  
│       ├── index.html  
│       ├── package.json  
│       └── tsconfig.json  
│  
├── docs/  
│   └── prd.md  
│  
└── package.json              \# Root package.json with workspace config
