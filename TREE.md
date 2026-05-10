financial-customer-churn-prediction-system/
├── backend/
│   ├── data/
│   │   └── Customer-Churn-Records.csv
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── constants/
│   │   │   └── roles.js
│   │   ├── controllers/
│   │   │   ├── admin.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── ml.controller.js
│   │   │   ├── prediction.controller.js
│   │   │   └── user.controller.js
│   │   ├── middleware/
│   │   │   ├── admin.middleware.js
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── predictionLimiter.js
│   │   │   ├── rateLimiter.js
│   │   │   ├── role.middleware.js
│   │   │   └── uploadMiddleware.js
│   │   ├── ml/
│   │   │   ├── churnModel.js
│   │   │   ├── metrics.js
│   │   │   ├── preprocess.js
│   │   │   ├── trainData.js
│   │   │   └── trainWithKaggle.js
│   │   ├── models/
│   │   │   ├── Log.model.js
│   │   │   ├── Prediction.model.js
│   │   │   └── User.model.js
│   │   ├── routes/
│   │   │   ├── admin.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── ml.routes.js
│   │   │   ├── prediction.routes.js
│   │   │   └── user.routes.js
│   │   ├── saved_model/
│   │   │   ├── model.json
│   │   │   ├── normalization.json
│   │   │   └── weights.json
│   │   ├── services/
│   │   │   ├── admin.service.js
│   │   │   ├── auth.service.js
│   │   │   └── prediction.service.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   └── logger.js
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/
│   ├── .env.development
│   ├── .env.production
│   ├── package-lock.json
│   └── package.json
├── frontend/
│   ├── FCCPS/
│   │   ├── public/
│   │   │   └── vite.svg
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   │   └── react.svg
│   │   │   ├── App.css
│   │   │   ├── App.jsx
│   │   │   ├── index.css
│   │   │   └── main.jsx
│   │   ├── .gitignore
│   │   ├── eslint.config.js
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── README.md
│   │   └── vite.config.js
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── ChurnChart.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── auth-context.js
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── Analytics.jsx
│   │   │   │   ├── Logs.jsx
│   │   │   │   ├── ModelControl.jsx
│   │   │   │   └── Users.jsx
│   │   │   ├── Bank/
│   │   │   │   ├── BankDashboard.jsx
│   │   │   │   ├── ChurnPrediction.jsx
│   │   │   │   ├── PredictionHistory.jsx
│   │   │   │   └── Profile.jsx
│   │   │   ├── Home.jsx
│   │   │   └── Login.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   ├── services/
│   │   │   ├── admin.service.js
│   │   │   ├── api.js
│   │   │   ├── auth.service.js
│   │   │   └── prediction.service.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── utils/
│   │   └── helpers.js
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── vite.config.js
├── HTML_CSS/
│   ├── dashboard.css
│   ├── dashboard.html
│   ├── home.css
│   ├── home.html
│   ├── Screenshot 2026-02-03 082429.png
│   ├── Screenshot 2026-02-15 171030.png
│   ├── Screenshot 2026-02-15 171405.png
│   ├── Screenshot 2026-02-15 182308.png
│   ├── Screenshot 2026-02-15 182444.png
│   ├── upload.css
│   └── upload.html
├── ml/
│   ├── model_meta.json
│   ├── predict.py
│   ├── rf_model.joblib
│   ├── requirements.txt
│   └── train_model.py
├── .gitignore
├── README.md
└── TREE.md
