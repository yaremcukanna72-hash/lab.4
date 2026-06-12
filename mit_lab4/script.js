const PALETTE = [
    '#f5e0dc', '#f2cdcd', '#f5c2e7', '#cba6f7',
    '#f38ba8', '#eba0ac', '#fab387', '#f9e2af',
    '#a6e3a1', '#94e2d5', '#89dceb', '#74c7ec',
    '#89b4fa', '#b4befe', '#313244', '#1e1e2e'
];

const PALETTE_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 8.5C19 9.88071 17.8807 11 16.5 11C15.1193 11 14 9.88071 14 8.5C14 7.11929 15.1193 6 16.5 6C17.8807 6 19 7.11929 19 8.5Z" fill="currentColor"/>
    <path d="M14 15.5C14 16.8807 12.8807 18 11.5 18C10.1193 18 9 16.8807 9 15.5C9 14.1193 10.1193 13 11.5 13C12.8807 13 14 14.1193 14 15.5Z" fill="currentColor"/>
    <path d="M9 8.5C9 9.88071 7.88071 11 6.5 11C5.11929 11 4 9.88071 4 8.5C4 7.11929 5.11929 6 6.5 6C7.88071 6 9 7.11929 9 8.5Z" fill="currentColor"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 11.0825 21.8767 10.1938 21.6465 9.35105C21.4178 8.51406 20.5739 8 19.7042 8H17C15.8954 8 15 7.10457 15 6V3.29581C15 2.42614 14.4859 1.5822 13.649 1.35352C12.8062 1.1233 11.9175 1 12 2ZM4 12C4 7.58172 7.58172 4 12 4C12.3167 4 12.6277 4.01833 12.933 4.05389V6C12.933 8.26437 14.755 10.1 17 10.1H19.9461C19.9817 10.4053 20 10.7163 20 11.033C20 15.4513 16.4513 19 12.033 19C7.61472 19 4.066 15.4513 4.066 11.033V12Z" fill="currentColor"/>
</svg>`;

let notes = JSON.parse(localStorage.getItem('notes')) || [];
let bgColor = localStorage.getItem('notes-bg-color') || '#11111b';
let noteToDelete = null;
let activeNoteId = null;

const notesContainer = document.getElementById('notes-container');
const addNoteBtn = document.getElementById('add-note-btn');
const bgPaletteBtn = document.getElementById('bg-palette-btn');
const bgPalettePicker = document.getElementById('bg-palette-picker');
const confirmModal = document.getElementById('confirm-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');


const globalNotePicker = document.createElement('div');
globalNotePicker.className = 'modern-picker hidden';
globalNotePicker.style.right = 'auto';
document.body.appendChild(globalNotePicker);

document.body.style.backgroundColor = bgColor;

initPalette(bgPalettePicker, (color) => {
    bgColor = color;
    document.body.style.backgroundColor = bgColor;
    saveToLocalStorage();
    bgPalettePicker.classList.add('hidden');
});

initPalette(globalNotePicker, (color) => {
    if (activeNoteId !== null) {
        const noteObj = notes.find(n => n.id === activeNoteId);
        if (noteObj) {
            noteObj.color = color;
            const noteEl = document.querySelector(`.note[data-id="${activeNoteId}"]`);
            if (noteEl) {
                noteEl.style.backgroundColor = color;
                noteEl.style.color = getContrastColor(color);
            }
            saveToLocalStorage();
        }
        globalNotePicker.classList.add('hidden');
    }
});

renderNotes();

addNoteBtn.addEventListener('click', createNote);

bgPaletteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    globalNotePicker.classList.add('hidden');
    bgPalettePicker.classList.toggle('hidden');
});

confirmDeleteBtn.addEventListener('click', () => {
    if (noteToDelete !== null) {
        notes = notes.filter(n => n.id !== noteToDelete);
        saveToLocalStorage();
        renderNotes();
        closeModal();
    }
});

cancelDeleteBtn.addEventListener('click', closeModal);

document.addEventListener('click', () => {
    document.querySelectorAll('.modern-picker').forEach(p => p.classList.add('hidden'));
});

function initPalette(container, onSelect) {
    container.innerHTML = '';
    PALETTE.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'swatch';
        swatch.style.backgroundColor = color;
        swatch.onclick = (e) => { e.stopPropagation(); onSelect(color); };
        container.appendChild(swatch);
    });

    const customInput = document.createElement('input');
    customInput.className = 'custom-color-input';
    customInput.placeholder = '#hex...';
    customInput.onclick = (e) => e.stopPropagation();
    customInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            const color = customInput.value.trim();
            if (/^#[0-9A-F]{6}$/i.test(color)) onSelect(color);
        }
    };
    container.appendChild(customInput);
}

function getRandomColor() {
    return PALETTE[Math.floor(Math.random() * 14)];
}

function createNote() {
    notes.push({
        id: Date.now(),
        text: '',
        color: getRandomColor(),
        x: 100 + (notes.length * 20) % 300,
        y: 100 + (notes.length * 20) % 300,
        width: 260,
        height: 160
    });
    saveToLocalStorage();
    renderNotes();
}

function getContrastColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return (((r * 299) + (g * 587) + (b * 114)) / 1000 >= 128) ? '#11111b' : '#cdd6f4';
}

function renderNotes() {
    notesContainer.innerHTML = '';
    notes.forEach(note => {
        const noteEl = document.createElement('div');
        noteEl.className = 'note';
        const textColor = getContrastColor(note.color);
        Object.assign(noteEl.style, {
            backgroundColor: note.color, color: textColor,
            left: `${note.x}px`, top: `${note.y}px`,
            width: `${note.width || 260}px`, height: `${note.height || 160}px`
        });

        noteEl.dataset.id = note.id;

        noteEl.innerHTML = `
            <div class="note-header">
                <div class="note-controls">
                    <button class="btn-icon note-palette-btn" title="Змінити колір">${PALETTE_ICON}</button>
                    <button class="btn-icon delete-btn" title="Видалити"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 7H18V18C18 19.6 16.6 21 15 21H9C7.4 21 6 19.6 6 18V7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 5C9 3.9 9.9 3 11 3H13C14.1 3 15 3.9 15 5V7H9V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
                </div>
            </div>
            <textarea class="note-content" placeholder="Напишіть щось...">${note.text}</textarea>`;

        noteEl.querySelector('.note-content').oninput = (e) => {
            notes.find(n => n.id === note.id).text = e.target.value;
            saveToLocalStorage();
        };

        noteEl.querySelector('.note-palette-btn').onclick = (e) => {
            e.stopPropagation();
            bgPalettePicker.classList.add('hidden');
            
            const isClosing = !globalNotePicker.classList.contains('hidden') && activeNoteId === note.id;
            
            if (isClosing) {
                globalNotePicker.classList.add('hidden');
                activeNoteId = null;
            } else {
                activeNoteId = note.id;
                const rect = e.currentTarget.getBoundingClientRect();
                
                globalNotePicker.style.top = `${rect.bottom + 8}px`;
                globalNotePicker.style.left = `${rect.left - 130}px`;
                
                globalNotePicker.classList.remove('hidden');
            }
        };

        noteEl.querySelector('.delete-btn').onclick = () => { noteToDelete = note.id; confirmModal.style.display = 'flex'; };

        noteEl.onmousedown = (e) => {
            if (e.target.closest('.note-controls') || e.target.tagName === 'TEXTAREA') return;
            const rect = noteEl.getBoundingClientRect();
            if (e.clientX > rect.right - 20 && e.clientY > rect.bottom - 20) return;

            let shiftX = e.clientX - rect.left, shiftY = e.clientY - rect.top;
            const onMove = (ev) => {
                noteEl.style.left = (ev.clientX - shiftX) + 'px';
                noteEl.style.top = (ev.clientY - shiftY) + 'px';
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMove);
                const n = notes.find(n => n.id === note.id);
                n.x = parseInt(noteEl.style.left); n.y = parseInt(noteEl.style.top);
                saveToLocalStorage();
            }, { once: true });
        };

        new ResizeObserver(() => {
            const n = notes.find(n => n.id === note.id);
            if (n) { Object.assign(n, { width: noteEl.offsetWidth, height: noteEl.offsetHeight }); saveToLocalStorage(); }
        }).observe(noteEl);

        notesContainer.appendChild(noteEl);
    });
}

function saveToLocalStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('notes-bg-color', bgColor);
}

function closeModal() { confirmModal.style.display = 'none'; noteToDelete = null; }