# Conecta Pinamar – Full (Spring Boot + CRA)

## Backend
```bash
cd backend
./mvnw spring-boot:run    # o mvn spring-boot:run
```
- Config en `src/main/resources/application.properties` (MySQL `s1`, root sin pass).
- Entidades: Product, Category, Seller (N:M y N:1).
- Endpoints:
  - GET `/api/search?q=` → { products[], categories[], sellers[] }
  - GET `/api/products/{id}`
  - GET `/api/categories/{id}/products`
  - GET `/api/sellers/{id}`
  - POST `/api/sellers/{id}/visit`

## Frontend (CRA)
```bash
cd frontend
npm i
npm start   # http://localhost:3000 (proxy → 8080)
```

Ajustá `App.js` con tus categorías fijas si querés replicar exactamente tu orden del `App.js` original.
