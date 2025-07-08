document.addEventListener("DOMContentLoaded", function () {
  const table = document.getElementById("docTable");
  const tbody = table.querySelector("tbody");
  const dateFilter = document.getElementById("dateFilter");
  const sortBtn = document.getElementById("sortBtn");
  const searchInput = document.getElementById("searchInput");

  let rows = [];
  let sortNewestFirst = true;

  fetch("assets/doc/docs.json")
    .then((response) => response.json())
    .then((data) => {
      // Build rows from JSON
      rows = data.map((doc) => {
        const tr = document.createElement("tr");
        const year = new Date(doc.date).getFullYear();
        tr.setAttribute("data-year", year);
        tr.innerHTML = `
          <td>${doc.date}</td>
          <td>${doc.title}</td>
          <td><a href="assets/doc/${encodeURIComponent(doc.filename)}" target="_blank">View</a></td>
          <td><a href="assets/doc/${encodeURIComponent(doc.filename)}" download>Download</a></td>
        `;
        return tr;
      });

      // Generate unique years and populate filter
      const years = [...new Set(rows.map(row => row.getAttribute("data-year")))].sort((a, b) => b - a);
      years.forEach(year => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        dateFilter.appendChild(option);
      });

      renderTable();

      // Display the latest two reports
      const sortedDocs = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
      const latestDocs = sortedDocs.slice(0, 2);

      const latestReportDiv = document.getElementById("latestReportContent");
      latestReportDiv.innerHTML = latestDocs.map(doc => `
        <div class="latest-entry">
          <p><strong>${doc.date}</strong> — <em>${doc.title}</em></p>
          <p>
            <a href="assets/doc/${encodeURIComponent(doc.filename)}" target="_blank">📄 View</a> |
            <a href="assets/doc/${encodeURIComponent(doc.filename)}" download>⬇️ Download</a>
          </p>
        </div>
      `).join("");
    });

  function renderTable() {
    const selectedYear = dateFilter.value;
    const keyword = searchInput.value.toLowerCase();

    const filteredRows = rows.filter(row => {
      const yearMatch = selectedYear === "all" || row.getAttribute("data-year") === selectedYear;
      const titleMatch = row.children[1].textContent.toLowerCase().includes(keyword);
      return yearMatch && titleMatch;
    });

    const sortedRows = filteredRows.sort((a, b) => {
      const dateA = new Date(a.children[0].textContent);
      const dateB = new Date(b.children[0].textContent);
      return sortNewestFirst ? dateB - dateA : dateA - dateB;
    });

    tbody.innerHTML = "";
    sortedRows.forEach(row => tbody.appendChild(row));
  }

  dateFilter.addEventListener("change", renderTable);
  sortBtn.addEventListener("click", () => {
    sortNewestFirst = !sortNewestFirst;
    sortBtn.textContent = sortNewestFirst ? "Sort: Newest First" : "Sort: Oldest First";
    renderTable();
  });
  searchInput.addEventListener("input", renderTable);
});