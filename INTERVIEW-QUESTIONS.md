# Interview Questions

1. **What is the purpose of this project?**
To manage products, track stock, identify low-stock items, update quantities and generate reports.

2. **Which technologies did you use?**
HTML for structure, CSS for UI/responsiveness and JavaScript for logic, validation and data persistence.

3. **What CRUD operations are implemented?**
Create, Read, Update and Delete products.

4. **How is low stock calculated?**
A product is low stock when quantity is less than or equal to its reorder level. Quantity zero means out of stock.

5. **How is inventory value calculated?**
Quantity × Unit Price, summed across all products.

6. **How do you prevent negative stock?**
Before Stock Out, JavaScript compares requested quantity with available quantity and rejects the update if it is larger.

7. **Why validate SKU?**
SKU identifies a product, so duplicate SKUs can cause incorrect updates and reporting. The app requires a unique SKU.

8. **Why localStorage?**
This is a basic HTML/CSS/JS task, so localStorage provides simple persistent browser storage without requiring a backend.

9. **What is DOM manipulation?**
JavaScript reads and changes HTML elements dynamically, such as tables, dashboard cards, reports and status badges.

10. **How does search work?**
The search text is compared against product name, SKU and category after converting text to lowercase.

11. **How does stock history work?**
Each Stock In/Out operation creates an activity record containing date, product, type, quantity and reason.

12. **What would you improve in production?**
I would add a Node.js/Express backend, PostgreSQL/MySQL database, authentication, role-based access, server-side validation, audit logs and deployment.

13. **What was the main challenge?**
Keeping inventory accurate after multiple operations. I solved it by validating every stock update and recalculating dashboard/report data after changes.

14. **Explain the project in 30 seconds.**
I built a responsive Inventory Management System using HTML, CSS and JavaScript. It provides product CRUD, stock-in/out, search/filter, low-stock alerts, inventory valuation, reports and CSV export. JavaScript handles the business rules and localStorage keeps the data persistent in the browser.
