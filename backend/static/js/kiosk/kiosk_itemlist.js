// kiosk_itemlist.js — Item List page

document.addEventListener('DOMContentLoaded', function () {
    const cart = JSON.parse(sessionStorage.getItem('kiosk_cart') || '[]');
    const container = document.getElementById('item-list-container');

    if (!cart.length) {
        container.innerHTML = '<p style="padding:1rem;color:#888;">No items selected. Go back to pick equipment.</p>';
        return;
    }

    cart.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'il__item';
        div.dataset.idx = idx;
        div.innerHTML = `
            <div class="il__item-left">
                <span class="il__item-name">${item.name}</span>
                <div class="il__item-img">${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}</div>
            </div>
            <div class="il__item-right">
                <span class="il__qty-label">quantity</span>
                <div class="il__qty-row">
                    <button class="il__qty-btn" onclick="changeQty(this, -1)">&#8722;</button>
                    <span class="il__qty-val">${item.quantity}</span>
                    <button class="il__qty-btn" onclick="changeQty(this, 1)">&#43;</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById('proceed-btn').addEventListener('click', function () {
        // Update cart quantities from the UI before proceeding
        const items = document.querySelectorAll('.il__item');
        const updatedCart = cart.map((item, idx) => {
            const qtyEl = items[idx] ? items[idx].querySelector('.il__qty-val') : null;
            return {
                id:       item.id,
                name:     item.name,
                quantity: qtyEl ? parseInt(qtyEl.textContent) : item.quantity,
                image:    item.image || '',
            };
        });
        sessionStorage.setItem('kiosk_cart', JSON.stringify(updatedCart));
        window.location.href = FILLOUT_URL;
    });
});

function changeQty(btn, delta) {
    const valEl = btn.parentElement.querySelector('.il__qty-val');
    let val = parseInt(valEl.textContent);
    val = Math.max(1, val + delta);
    valEl.textContent = val;
}
