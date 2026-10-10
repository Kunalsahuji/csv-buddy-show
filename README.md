# 📊 CSV Insight — Upload, Explore & Filter CSV Data

**CSV Insight** is a high-fidelity, secure, and blazing-fast web application that lets anyone upload a CSV file and explore it instantly in the browser. Drop any dataset to view it as a clean interactive table — search across every column, filter by any field, sort numerically or alphabetically, paginate through large files, and export the filtered results as a fresh CSV. 100% client-side: your data never leaves your device.

---

## 📌 Project Details
- **Objective**: Build a world-class, responsive CSV exploration tool that makes raw spreadsheet data instantly readable, searchable, and shareable — with zero backend and zero data leakage.
- **Key Modules**: Drag & Drop Upload Zone with validation, Smart Column Filters (auto dropdowns for low-cardinality columns, text inputs for high-cardinality ones), Global Search, Sortable Data Table with Pagination, and One-Click Filtered Export.
- **Design Philosophy**: Strict adherence to a clean, modern, and accessible design system — semantic design tokens, premium card layouts, and micro-interactions across all desktop and mobile viewports.
- **Tech Stack**:
  - **Frontend**: React 19 + TypeScript
  - **Framework**: TanStack Start (Vite)
  - **Styling**: Tailwind CSS v4 (Modern Design System)
  - **CSV Parsing**: PapaParse
  - **Icons**: Lucide React

---

## ✨ Features
- **Drag & Drop Upload**: Intuitive upload zone with drag-over animations, click-to-browse, live file validation (.csv only, up to 10 MB, non-empty files).
- **Instant Data Rendering**: Header-aware CSV parsing with automatic column detection and row counts displayed in summary cards.
- **Global Search**: A single query matches across every column at once, case-insensitive.
- **Smart Column Filters**: Every column becomes a filter. Columns with ≤ 50 unique values get a dropdown; high-cardinality columns get a text input. Active filters are highlighted, and a one-tap "Clear all" resets everything.
- **Sortable Table**: Click any header to sort ascending → descending → reset. Numeric columns are auto-detected and sorted numerically; everything else sorts alphabetically.
- **Responsive Pagination**: Large datasets are paginated (15 rows per page) with smooth previous/next navigation and live row counts ("Showing X–Y of Z, filtered from N").
- **Export Filtered Results**: Download exactly the rows you're looking at — the filtered, sorted view — as a new CSV file, generated entirely in the browser.
- **Sample Data Demo**: One click loads a real 1,000-row shampoo shelf-audit dataset so the experience can be explored without a file at hand.
- **Enterprise Privacy & Security**: No servers, no uploads, no tracking of file contents — parsing, filtering, sorting, and exporting all happen locally in the browser via PapaParse and memoized React state.
- **Performance Optimized**: Built with modern React standards — memoized filtering/sorting pipelines, virtual-friendly pagination, and skeleton-free instant parsing for a flawless user experience.

---

## 📦 Project Setup

```bash
# Clone the repository
git clone https://github.com/Kunalsahuji/csv-buddy-show.git
cd csv-buddy-show


# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

No environment variables, database, or backend configuration required — the app is fully self-contained on the frontend.

---

## 🔗 Live Implementation
🚀 **Live Demo**: [https://csv-buddy-show.lovable.app/](https://csv-buddy-show.lovable.app/)  
📂 **GitHub Repository**: [https://github.com/Kunalsahuji/csv-buddy-show](https://github.com/Kunalsahuji/csv-buddy-show)  
🧪 **Try it instantly**: Open the live demo and click **"Try sample data"** — a real 1,000-row shampoo shelf-audit dataset loads immediately, so you can test search, filters, sorting and export without preparing a file.

| Detail | Value |
| --- | --- |
| Deployed URL | https://csv-buddy-show.lovable.app/ |
| Git Repository | https://github.com/Kunalsahuji/csv-buddy-show |
| Hosting | Lovable Cloud (frontend build, auto-deployed) |
| Backend | None — 100% client-side |
| Sample Dataset | 1,000 rows · shampoo shelf-audit (Brand, Store, City, Price, Rating, Stock, Date) |


---

## 🤝 Connect with Me
I'm **Kunal Sahu** — a full-stack developer (MERN) who loves turning rough datasets and briefs into clean, fast, production-ready products. If you'd like to discuss this project, ask for a walkthrough, or collaborate on something, reach out any time:

📦 **GitHub**: [github.com/Kunalsahuji](https://github.com/Kunalsahuji)  
🔗 **LinkedIn**: [kunal-sahu-7688ba1b0](https://www.linkedin.com/in/kunal-sahu-7688ba1b0)  
📌 **Notion**: [Watch my content](https://www.notion.so/1dff7c6ce1bb803787fbddd34e422ab4?v=1e0f7c6ce1bb8052b14c000cb57448ee&pvs=4)  
📧 **Email**: [ksahu0103@gmail.com](mailto:ksahu0103@gmail.com)  
🗂️ **This project**: [csv-buddy-show](https://github.com/Kunalsahuji/csv-buddy-show) · [Live demo](https://csv-buddy-show.lovable.app/)

> Feedback, feature requests, and code reviews are all welcome — open an issue on the repo or drop me a mail.


---

## 🙌 Acknowledgements
Developed with ❤️ by [Kunal Sahu](https://github.com/Kunalsahuji).
