const deleteProduct = (btn) => {
  console.log(btn);
  const productId = btn.parentNode.querySelector("[name=productId]").value;
  const csrfToken = btn.parentNode.querySelector("[name=_csrf]").value;
  const productElement = btn.closest("article");
  fetch(`/admin/product/${productId}`, {
    method: "DELETE",
    headers: {
      "csrf-token": csrfToken,
    },
  })
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .then((data) => {
      productElement.parentNode.removeChild(productElement);
    })
    .catch((e) => {
      console.log(e);
    });
};
