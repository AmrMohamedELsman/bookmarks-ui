const bookmarksDiv = document.querySelector(".bookmarks");
const categorySuggestionsContainer = document.querySelector(".category-suggestions div");
const categoryInput = document.querySelector(".category");
const showAll = document.querySelector(".all");
const categoryButtonsContainer = document.querySelector(".category-buttons div");
localStorage.removeItem("active-category");


showAll.addEventListener("click", async function () {
    await disblayBookmarks();
    // Method One
    const categoryButtons = document.querySelectorAll(".category-buttons div span");
    categoryButtons.forEach((button) => button.classList.remove("active"));
    localStorage.removeItem("active-category");
    // Method Two
    // location.reload();
});


async function saveBookmark() {
    let title = document.querySelector(".title").value.trim();
    let url = document.querySelector(".url").value.trim();
    let category = document.querySelector('.category').value.trim();

    if (!title || !url || !category) {
        alert("Please Fill in all Fields");
        return;
    }

    const response = await fetch("http://localhost:5000/bookmarks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, url, category }),
    });

    if (response.ok) {
        document.querySelectorAll("input").forEach((ele) => (ele.value = ""));
        await updateUI();
    } else {
        alert("Failed to save bookmark");
    }
}




async function disblayBookmarks() {
    const response = await fetch("http://localhost:5000/bookmarks");
    const bookmarks = await response.json();
    bookmarksDiv.innerHTML = "";

    bookmarks.forEach((bookmark, index) => {
        let bookmarkElement = document.createElement("div");
        bookmarkElement.innerHTML = `
            <div class="cat">${bookmark.category}</div>
            <div class="link"><a href="${bookmark.url}" target="_blank">${bookmark.title}</a></div>
            <button onclick="deleteBookmark('${bookmark._id}')">Delete</button>
        `;
        bookmarksDiv.appendChild(bookmarkElement);
    });
}





// دالة لفلترة الإشارات المرجعية حسب الفئة بناءً على قاعدة البيانات
async function filterBookmarksByCategory(category) {
    const response = await fetch(`http://localhost:5000/bookmarks?category=${category}`);
    const bookmarks = await response.json();

    bookmarksDiv.innerHTML = "";
    bookmarks.forEach((bookmark, index) => {
        const bookmarkElement = document.createElement("div");
        bookmarkElement.innerHTML = `
            <span class="number">${index + 1}</span>
            <div class="link"><a href="${bookmark.url}" target="_blank">${bookmark.title}</a></div>
            <button onclick="deleteBookmark('${bookmark._id}')">Delete</button>
        `;
        bookmarksDiv.appendChild(bookmarkElement);
    });
}





// دالة لجلب الفئات من قاعدة البيانات وعرضها كاقتراحات
async function displayCategorySuggestions() {
    const response = await fetch("http://localhost:5000/bookmarks/categories");
    const categories = await response.json();

    categorySuggestionsContainer.innerHTML = "";
    categories.forEach((category) => {
        const categoryElement = document.createElement("span");
        categoryElement.textContent = category;
        categoryElement.addEventListener("click", () => (categoryInput.value = category));
        categorySuggestionsContainer.appendChild(categoryElement);
    });
}




let activeCategory = null;


async function displayCategoryButtons() {
    const response = await fetch("http://localhost:5000/bookmarks/categories");
    const categories = await response.json();

    // جلب الفئة النشطة من السيرفر
    const activeResponse = await fetch("http://localhost:5000/active-category");
    const activeData = await activeResponse.json();
    let activeCategory = activeData.activeCategory;

    categoryButtonsContainer.innerHTML = "";
    categories.forEach((category) => {
        const categoryElement = document.createElement("span");
        categoryElement.textContent = category;
        categoryElement.addEventListener("click", async function () {
            activeCategory = category;
            await fetch("http://localhost:5000/active-category", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category })
            });

            await filterBookmarksByCategory(category);

            document.querySelectorAll(".category-buttons div span").forEach((button) => button.classList.remove("active"));
            this.classList.add("active");
        });

        if (activeCategory === category) {
            categoryElement.classList.add("active");
        }

        categoryButtonsContainer.appendChild(categoryElement);
    });
}




// دالة لحذف إشارة مرجعية
async function deleteBookmark(id) {
    const response = await fetch(`http://localhost:5000/bookmarks/${id}`, {
        method: "DELETE",
    });

    if (response.ok) {
        await updateUI();
    } else {
        alert("Failed to delete bookmark");
    }
}

  
async function updateUI() {
    await disblayBookmarks();
    await displayCategorySuggestions();
    await displayCategoryButtons();
}

updateUI();