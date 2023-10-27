let input = document.querySelector(".search-container__input");
let list = document.querySelector(".autocomplete-list");
const AUTOCOMPLETE_DELAY = 200;

input.oninput = debounce(readUserRequest, AUTOCOMPLETE_DELAY);

function readUserRequest() {
  const userRequest = input.value.trim();

  if (isValidUserRequest(userRequest)) {
    findRepositories(userRequest);
  } else {
    resetSearch();
  }
}

const REQUEST_INVALID_CHARS = [" "];

function isValidUserRequest(request) {
  return (
    request &&
    !request.split("").some((char) => REQUEST_INVALID_CHARS.indexOf(char) != -1)
  );
}

function findRepositories(request) {
  fetch(`https://api.github.com/search/repositories?q=${request}&per_page=5`)
    .then((response) => response.json())
    .then(updateAutocompleteList)
    .catch((err) => {
      throw err;
    });
}

function updateAutocompleteList(data) {
  list.innerHTML = "";

  const fragment = document.createDocumentFragment();

  data.items.forEach((item) => {
    fragment.appendChild(createListItem(item));
  });

  list.appendChild(fragment);
}

function createListItem(item) {
  const listItem = document.createElement("div");
  listItem.classList = "autocomplete-list__item";

  const listItemBtn = document.createElement("button");
  listItemBtn.classList = "autocomplete-list__btn";
  listItemBtn.textContent = item.name;

  listItemBtn.addEventListener("click", () => {
    updateResultList(item);
  });

  listItem.appendChild(listItemBtn);

  return listItem;
}

const resultList = document.querySelector(".result-list");

function updateResultList(data) {
  const resultListItems = Array.from(resultList.children);

  if (resultListItems.length >= 5) {
    resultListItems[0].remove();
  }

  const {
    name,
    owner: { login },
    stargazers_count: stars,
  } = data;
  const fragment = document.createDocumentFragment();

  const item = document.createElement("div");
  item.classList = "result-list__item";
  fragment.appendChild(item);

  const dataContainer = document.createElement("div");
  item.appendChild(dataContainer);

  const dataContainerName = document.createElement("p");
  dataContainerName.classList = "result-list__item--text";
  dataContainerName.textContent = `Name: ${name}`;
  dataContainer.appendChild(dataContainerName);

  const dataContainerLogin = document.createElement("p");
  dataContainerLogin.classList = "result-list__item--text";
  dataContainerLogin.textContent = `Owner: ${login}`;
  dataContainer.appendChild(dataContainerLogin);

  const dataContainerStars = document.createElement("p");
  dataContainerStars.classList = "result-list__item--text";
  dataContainerStars.textContent = `Stars: ${stars}`;
  dataContainer.appendChild(dataContainerStars);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList = "result-list__closeBtn";
  deleteBtn.onclick = () => item.remove();
  item.appendChild(deleteBtn);

  resultList.appendChild(fragment);

  resetSearch();
}

function resetSearch() {
  input.value = "";
  list.innerHTML = "";
}

function debounce(fn, ms) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => fn.call(this, ...arguments), ms);
  };
}
