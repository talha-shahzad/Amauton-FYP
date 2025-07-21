# Amauton  
*Streamlining Amazon Seller Operations Through Advanced Automation and AI* :contentReference[oaicite:0]{index=0}  

<img width="1920" height="1080" alt="Amauton" src="https://github.com/user-attachments/assets/b479f2cd-2d48-4033-92ee-e8808fd74c63" />

## 🚀 Project Overview  
Amauton is a modular, micro‑services platform designed to automate key workflows for Amazon sellers (UK focus). By combining AI‑driven analytics, web scraping, and deep‑learning–based image comparison, it enables end‑to‑end seller support—from product discovery through dynamic pricing and sales analytics—with minimal manual effort.

<img width="1920" height="1080" alt="Amauton (2)" src="https://github.com/user-attachments/assets/9eaac212-660f-4701-88d4-76ebe56a0071" />


## 📖 Key Modules  
1. **Product Discovery & Extraction**  
2. **Supplier Sourcing**  
3. **Profitability Analysis & Listings**  
4. **Dynamic Pricing & Competitor Analysis**  
5. **Sales Analytics**

## 🏗 Architecture  
- **Micro‑services** communicating via an API Gateway  
- **MongoDB** as the primary data store for JSON‑based product, supplier, pricing, and sales records  
- **Front‑end** (SPA or mobile‑optimized web UI) ↔ **API Gateway** ↔ **Backend Services**  
- **Integration** with Amazon SP‑API, retailer scraping pipelines, and image‑matching services  

## 💻 Technology Stack  

<img width="1920" height="1080" alt="Amauton (1)" src="https://github.com/user-attachments/assets/a03764f7-8def-4b32-a518-2ab46e74cf44" />


- **Backend Languages & Frameworks:** Python (Flask/FastAPI) or Node.js (Express)  
- **Data Storage:** MongoDB  
- **Web Scraping:** Scrapy / BeautifulSoup / Selenium / custom Node.js scripts  
- **LLM & AI:** TensorFlow or PyTorch for image embedding (ResNet/EfficientNet/CLIP); custom trend‑scoring logic  
- **APIs:** Amazon SP‑API, retailer site endpoints  
- **Containerization & CI/CD:** Docker, GitHub Actions (optional)  

## 🔧 Installation & Setup  
1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-org/amauton.git

2. **Install dependencies**
   *Main*
   ```bash
   npm install
   ```
   *Server*
   ```bash
   cd Server
   npm install
   ```
   *Flask*
   ```bash
   cd Flask-app
   pip install -r requirements.txt
   ```
3. **Start the App**
   *CLient*
   ```bash
   cd Cient
   npm run dev
   ```
   *Server*
   ```bash
   cd Server
   node Server.js
   ```
   *Flask*
   ```bash
   cd Flask-app
   python main.py
   ```
