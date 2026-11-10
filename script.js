// GB Imports — catálogo, detalhes, carrinho e finalização pelo WhatsApp.
const WHATSAPP_NUMBER = "5561995100750";
const INSTAGRAM_URL = "";
const money = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const whatsappUrl = message => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
const cart = new Map();
let selectedProduct = null;

document.getElementById("contactCta").href = whatsappUrl("Olá! Vim pelo site da GB Imports e gostaria de conhecer o catálogo.");
document.getElementById("year").textContent = new Date().getFullYear();
if (INSTAGRAM_URL) document.getElementById("instagramLink").href = INSTAGRAM_URL;
else document.getElementById("instagramArea").hidden = true;

// Filtros.
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  const category = button.dataset.filter;
  document.querySelectorAll(".product-card").forEach(card => card.hidden = category !== "Todos" && card.dataset.category !== category);
}));
document.querySelectorAll(".category-card").forEach(button => button.addEventListener("click", () => {
  const category = button.dataset.filter;
  document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item.dataset.filter === category));
  document.querySelectorAll(".product-card").forEach(card => card.hidden = card.dataset.category !== category);
  document.getElementById("produtos").scrollIntoView({ behavior: "smooth" });
}));

// Produtos com preço: abrir detalhes; sem preço: consulta pelo WhatsApp.
const productDialog = document.getElementById("productDialog");
document.querySelectorAll(".ask-product[data-product-id]").forEach(button => {
  button.addEventListener("click", () => {
    selectedProduct = {
      id: button.dataset.productId,
      name: button.dataset.productName,
      price: Number(button.dataset.productPrice),
      image: button.dataset.productImage,
      description: button.closest(".product-card").querySelector(".product-info p")?.textContent || ""
    };
    document.getElementById("detailImage").src = selectedProduct.image;
    document.getElementById("detailImage").alt = selectedProduct.name;
    document.getElementById("detailName").textContent = selectedProduct.name;
    document.getElementById("detailDescription").textContent = selectedProduct.description;
    document.getElementById("detailPrice").textContent = money(selectedProduct.price);
    productDialog.showModal();
  });
});
document.getElementById("closeProductBtn").addEventListener("click", () => productDialog.close());
productDialog.addEventListener("click", event => { if (event.target === productDialog) productDialog.close(); });

document.getElementById("detailAddBtn").addEventListener("click", () => {
  if (!selectedProduct) return;
  const current = cart.get(selectedProduct.id);
  cart.set(selectedProduct.id, { ...selectedProduct, qty: (current?.qty || 0) + 1 });
  renderCart();
  productDialog.close();
  document.getElementById("cartDialog").showModal();
});

document.querySelectorAll(".ask-product:not([data-product-id])").forEach(button => button.addEventListener("click", () => {
  const product = button.dataset.product || button.closest(".product-card")?.querySelector("h3")?.textContent || "produto";
  window.location.href = whatsappUrl(`Olá! Tenho interesse em ${product}. Poderia me enviar opções, valores e disponibilidade?`);
}));

// Carrinho.
const dialog = document.getElementById("cartDialog");
const cartItems = document.getElementById("cartItems");
const checkoutBtn = document.getElementById("checkoutBtn");
const shareHint = document.getElementById("shareHint");
function totalValue() { return [...cart.values()].reduce((sum, item) => sum + item.price * item.qty, 0); }
function renderCart() {
  const items = [...cart.values()];
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const total = totalValue();
  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTotal").textContent = money(total);
  document.getElementById("dialogTotal").textContent = money(total);
  document.getElementById("cartStatus").textContent = count ? `${count} item(ns) no pedido.` : "Nenhum produto selecionado ainda.";
  checkoutBtn.disabled = count === 0;
  cartItems.innerHTML = items.length ? items.map(item => `
    <div class="cart-line">
      <img src="${item.image}" alt="">
      <div><strong>${item.name}</strong><small>${money(item.price)} cada</small>
        <div class="qty-controls">
          <button type="button" data-action="minus" data-id="${item.id}" aria-label="Diminuir">−</button>
          <span>${item.qty}</span>
          <button type="button" data-action="plus" data-id="${item.id}" aria-label="Aumentar">+</button>
          <button type="button" data-action="remove" data-id="${item.id}" aria-label="Remover">×</button>
        </div>
      </div><span class="cart-line-price">${money(item.price * item.qty)}</span>
    </div>`).join("") : '<p class="empty-cart">Seu pedido está vazio. Escolha um produto para começar.</p>';
}
cartItems.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const item = cart.get(button.dataset.id); if (!item) return;
  if (button.dataset.action === "plus") item.qty++;
  if (button.dataset.action === "minus") item.qty--;
  if (button.dataset.action === "remove" || item.qty <= 0) cart.delete(button.dataset.id);
  renderCart();
});
document.getElementById("openCartBtn").addEventListener("click", () => dialog.showModal());
document.getElementById("closeCartBtn").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });

// Arte do pedido com as fotos dos produtos selecionados.
async function createOrderImage(items, total) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = Math.max(900, 390 + items.length * 190);
  const ctx = canvas.getContext("2d");
  const bg = ctx.createLinearGradient(0, 0, 1200, canvas.height);
  bg.addColorStop(0, "#fff8fa"); bg.addColorStop(1, "#efd9e2");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 1200, canvas.height);
  ctx.strokeStyle = "#bd8a9c"; ctx.lineWidth = 5; ctx.strokeRect(28, 28, 1144, canvas.height - 56);
  ctx.textAlign = "center"; ctx.fillStyle = "#6e4054"; ctx.font = "bold 58px Georgia"; ctx.fillText("GB IMPORTS", 600, 112);
  ctx.fillStyle = "#a56f82"; ctx.font = "italic 28px Georgia"; ctx.fillText("por Gabrielle Benevides", 600, 158);
  ctx.strokeStyle = "#c99eac"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(150, 190); ctx.lineTo(1050, 190); ctx.stroke();
  ctx.textAlign = "left"; ctx.fillStyle = "#573746"; ctx.font = "bold 34px Georgia"; ctx.fillText("RESUMO DO PEDIDO", 95, 250);
  let y = 285;
  for (const item of items) {
    const img = new Image(); img.src = item.image;
    try { await img.decode(); } catch (_) {}
    ctx.fillStyle = "#ffffffd9";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(78, y, 1044, 155, 18); else ctx.rect(78, y, 1044, 155);
    ctx.fill();
    if (img.complete && img.naturalWidth) {
      const scale = Math.min(125 / img.width, 130 / img.height);
      const iw = img.width * scale, ih = img.height * scale;
      ctx.drawImage(img, 98 + (125 - iw) / 2, y + 12 + (130 - ih) / 2, iw, ih);
    }
    ctx.fillStyle = "#513442"; ctx.font = "bold 29px Georgia"; ctx.fillText(item.name, 250, y + 57, 600);
    ctx.fillStyle = "#876b78"; ctx.font = "23px Arial"; ctx.fillText(`${item.qty} x ${money(item.price)}`, 250, y + 100);
    ctx.textAlign = "right"; ctx.fillStyle = "#8d4f6a"; ctx.font = "bold 27px Arial"; ctx.fillText(money(item.price * item.qty), 1080, y + 84);
    ctx.textAlign = "left"; y += 175;
  }
  ctx.fillStyle = "#6e4054"; ctx.font = "bold 36px Georgia"; ctx.fillText("TOTAL DOS PRODUTOS", 95, y + 12);
  ctx.textAlign = "right"; ctx.font = "bold 48px Georgia"; ctx.fillStyle = "#a45173"; ctx.fillText(money(total), 1080, y + 15);
  ctx.textAlign = "center"; ctx.fillStyle = "#806b74"; ctx.font = "22px Arial";
  ctx.fillText("Frete e prazo a confirmar • Enviamos para todo o Brasil", 600, y + 75);
  ctx.fillText("Pagamento: Pix, cartão de crédito e débito", 600, y + 110);
  ctx.fillStyle = "#a56f82"; ctx.font = "italic 22px Georgia"; ctx.fillText("Obrigada por escolher a GB Imports!", 600, y + 150);
  return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
}

checkoutBtn.addEventListener("click", async () => {
  const items = [...cart.values()].map(item => ({ ...item }));
  if (!items.length) return;
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Preparando pedido...";
  const total = totalValue();
  const lines = items.map(item => `• ${item.name} — ${item.qty} x ${money(item.price)} = ${money(item.price * item.qty)}`).join("\n");
  const message = `Olá, GB Imports! 💗 Gostaria de finalizar este pedido:\n\n${lines}\n\nTotal dos produtos: ${money(total)}\nPagamento: Pix, crédito ou débito (a combinar).\nEndereço, frete e prazo: a combinar.`;
  try {
    const blob = await createOrderImage(items, total);
    if (!blob) throw new Error("Não foi possível gerar a imagem.");
    const file = new File([blob], "pedido-gb-imports.png", { type: "image/png" });

    // No celular/navegador compatível, abre o compartilhamento com imagem + texto.
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ title: "Pedido GB Imports", text: message, files: [file] });
      shareHint.textContent = "Escolha WhatsApp na tela de compartilhamento e confirme o envio.";
    } else {
      // Em desktop, não há anexo automático pelo link wa.me: baixa a arte e abre a conversa.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "pedido-gb-imports.png"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      window.location.href = whatsappUrl(message + "\n\nA imagem do pedido foi baixada. Anexe o arquivo pedido-gb-imports.png nesta conversa antes de enviar.");
      shareHint.textContent = "A imagem foi baixada. No WhatsApp, anexe pedido-gb-imports.png antes de enviar.";
    }
  } catch (error) {
    if (error.name !== "AbortError") shareHint.textContent = "Não foi possível gerar ou compartilhar a imagem. Tente novamente ou entre em contato pelo WhatsApp.";
  } finally {
    checkoutBtn.disabled = cart.size === 0;
    checkoutBtn.textContent = "Gerar imagem e enviar pelo WhatsApp ↗";
  }
});

document.getElementById("menuToggle").addEventListener("click", () => document.getElementById("nav").classList.toggle("open"));
document.querySelectorAll("#nav a").forEach(link => link.addEventListener("click", () => document.getElementById("nav").classList.remove("open")));
renderCart();
