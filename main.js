
// استيراد Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔥 إعداد Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDDhLpHYubiTxK334og0UKno1jf9RWrKbk",
    authDomain: "test1-b281b.firebaseapp.com",
    projectId: "test1-b281b",
    storageBucket: "test1-b281b.appspot.com",
    messagingSenderId: "90999483031",
    appId: "1:90999483031:web:ceefa258e3a017833797d2"
};

// ✅ تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ تحديد عناصر HTML
const bookmarksDiv = document.querySelector(".bookmarks");
const categorySuggestionsContainer = document.querySelector(".category-suggestions div");
const categoryInput = document.querySelector(".category");
const showAll = document.querySelector(".all");
const categoryButtonsContainer = document.querySelector(".category-buttons div");

// ✅ حفظ إشارة مرجعية جديدة
async function saveBookmark() {
    let title = document.querySelector(".title").value.trim();
    let url = document.querySelector(".url").value.trim();
    let category = document.querySelector(".category").value.trim();

    if (!title || !url || !category) {
        alert("Please Fill in all Fields");
        return;
    }

    try {
        await addDoc(collection(db, "bookmarks"), { title, url, category });
        document.querySelectorAll("input").forEach(ele => ele.value = "");
        updateUI();
    } catch (error) {
        alert("Error saving bookmark: " + error.message);
    }
}

// / ✅ عرض كل الإشارات المرجعية
async function displayBookmarks() {
    const querySnapshot = await getDocs(collection(db, "bookmarks"));
    bookmarksDiv.innerHTML = "";

    querySnapshot.forEach((doc) => {
        let bookmark = doc.data();
        let bookmarkElement = document.createElement("div");
        bookmarkElement.innerHTML = `
            <div class="cat">${bookmark.category}</div>
            <div class="link"><a href="${bookmark.url}" target="_blank">${bookmark.title}</a></div>
            <button onclick="deleteBookmark('${doc.id}')">Delete</button>
        `;
        bookmarksDiv.appendChild(bookmarkElement);
    });
}

// ✅ عرض كل الإشارات المرجعية
async function displayCategoryButtons() {
    const querySnapshot = await getDocs(collection(db, "bookmarks"));
    let categories = new Set();

    querySnapshot.forEach(doc => categories.add(doc.data().category));

    const categoryButtonsContainer = document.querySelector(".category-buttons div");
    categoryButtonsContainer.innerHTML = "";

    // ✅ زر "إظهار الكل"
    const allButton = document.createElement("span");
    allButton.textContent = "Show All";
    allButton.classList.add("active");
    allButton.addEventListener("click", async function () {
        await updateUI();
        document.querySelectorAll(".category-buttons div span").forEach(button => button.classList.remove("active"));
        this.classList.add("active");
    });
    categoryButtonsContainer.appendChild(allButton);

    // ✅ أزرار الفئات
    categories.forEach(category => {
        const categoryElement = document.createElement("span");
        categoryElement.textContent = category;
        categoryElement.setAttribute("data-category", category);
        categoryElement.addEventListener("click", async function () {
            await filterBookmarksByCategory(category);
        });

        categoryButtonsContainer.appendChild(categoryElement);
    });
}



// ✅ تصفية الإشارات المرجعية حسب الفئة
async function filterBookmarksByCategory(category) {
    const q = query(collection(db, "bookmarks"), where("category", "==", category));
    const querySnapshot = await getDocs(q);

    bookmarksDiv.innerHTML = "";
    querySnapshot.forEach((doc) => {
        let bookmark = doc.data();
        let bookmarkElement = document.createElement("div");
        bookmarkElement.innerHTML = `
            <div class="cat">${bookmark.category}</div>
            <div class="link"><a href="${bookmark.url}" target="_blank">${bookmark.title}</a></div>
            <button onclick="deleteBookmark('${doc.id}')">Delete</button>
        `;
        bookmarksDiv.appendChild(bookmarkElement);
    });

    // ✅ تحديث الزر النشط
    document.querySelectorAll(".category-buttons div span").forEach(button => button.classList.remove("active"));
    document.querySelector(`[data-category="${category}"]`)?.classList.add("active");
}

// ✅ جلب الفئات وعرضها كمقترحات
async function displayCategorySuggestions() {
    const querySnapshot = await getDocs(collection(db, "bookmarks"));
    let categories = new Set();

    querySnapshot.forEach(doc => categories.add(doc.data().category));

    categorySuggestionsContainer.innerHTML = "";
    categories.forEach(category => {
        const categoryElement = document.createElement("span");
        categoryElement.textContent = category;
        categoryElement.addEventListener("click", () => (categoryInput.value = category));
        categorySuggestionsContainer.appendChild(categoryElement);
    });
}



// ✅ حذف إشارة مرجعية
async function deleteBookmark(id) {
    try {
        await deleteDoc(doc(db, "bookmarks", id));
        updateUI();
    } catch (error) {
        alert("Failed to delete bookmark: " + error.message);
    }
}

// ✅ تحديث الواجهة
async function updateUI() {
    await displayBookmarks();
    await displayCategorySuggestions();
    await displayCategoryButtons();
}

updateUI();
