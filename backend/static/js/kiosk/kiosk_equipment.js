// kiosk_equipment.js — Pick Equipment page

document.addEventListener('DOMContentLoaded', function () {
    sessionStorage.setItem('kiosk_lab', KIOSK_LAB);
    sessionStorage.setItem('kiosk_type', KIOSK_TYPE);

    // Restore any existing cart
    const cart = JSON.parse(sessionStorage.getItem('kiosk_cart') || '[]');

    loadEquipment(cart);

    document.getElementById('search-input').addEventListener('input', function () {
        const q = this.value.toLowerCase();
        document.querySelectorAll('.peq__card').forEach(card => {
            const name = card.querySelector('.peq__card-name').textContent.toLowerCase();
            card.style.display = name.includes(q) ? '' : 'none';
        });
    });

    document.getElementById('reserve-btn').addEventListener('click', function () {
        saveCartAndGo();
    });
});

function loadEquipment(existingCart) {
    fetch(API_EQUIPMENT_URL + '?lab=' + KIOSK_LAB)
        .then(r => r.json())
        .then(data => {
            const grid = document.getElementById('equipment-grid');
            grid.innerHTML = '';
            if (!data.equipment.length) {
                grid.innerHTML = '<p style="padding:2rem;color:#888;">No equipment found for this laboratory.</p>';
                return;
            }
            data.equipment.forEach(eq => {
                const inCart = existingCart.find(c => c.id === eq.id);
                const qty = inCart ? inCart.quantity : 1;
                const added = !!inCart;

                const card = document.createElement('div');
                card.className = 'peq__card' + (added ? ' peq__card--selected' : '');
                card.dataset.id = eq.id;
                card.dataset.name = eq.name;
                card.dataset.image = eq.image || '';
                card.innerHTML = `
                    <div class="peq__card-img">
                        ${eq.image ? `<img src="${eq.image}" alt="${eq.name}" style="width:100%;height:100%;object-fit:cover;">` : ''}
                    </div>
                    <span class="peq__card-name">${eq.name}</span>
                    <span class="peq__card-stock">Available: ${eq.available_quantity}</span>
                    <div class="peq__qty-row">
                        <button class="peq__qty-btn" onclick="changeQty(this, -1)">&#8722;</button>
                        <span class="peq__qty-val">${qty}</span>
                        <button class="peq__qty-btn" onclick="changeQty(this, 1)">&#43;</button>
                    </div>
                    <button class="peq__add-btn${added ? ' peq__add-btn--added' : ''}" onclick="addItem(this)">
                        ${added ? 'Added' : 'Add'}
                    </button>
                `;
                card.dataset.maxQty = eq.available_quantity;
                grid.appendChild(card);
            });
        });
}

function changeQty(btn, delta) {
    const card  = btn.closest('.peq__card');
    const valEl = btn.parentElement.querySelector('.peq__qty-val');
    const max   = parseInt(card.dataset.maxQty) || Infinity;
    let val = parseInt(valEl.textContent);
    val = Math.min(max, Math.max(1, val + delta));
    valEl.textContent = val;
}

function addItem(btn) {
    const card = btn.closest('.peq__card');
    card.classList.toggle('peq__card--selected');
    const added = card.classList.contains('peq__card--selected');
    btn.textContent = added ? 'Added' : 'Add';
    btn.classList.toggle('peq__add-btn--added', added);
}

function saveCartAndGo() {
    const cart = [];
    document.querySelectorAll('.peq__card--selected').forEach(card => {
        cart.push({
            id:       parseInt(card.dataset.id),
            name:     card.dataset.name,
            quantity: parseInt(card.querySelector('.peq__qty-val').textContent),
            image:    card.dataset.image || '',
        });
    });
    if (!cart.length) {
        alert('Please add at least one equipment item.');
        return;
    }
    sessionStorage.setItem('kiosk_cart', JSON.stringify(cart));
    window.location.href = ITEMS_URL;
}
