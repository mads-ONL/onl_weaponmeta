let weaponData = null;
let loadedFiles = {};

const fileInput = document.getElementById('fileInput');
const modeToggle = document.getElementById('modeToggle');

// Initialize file input attributes on page load
function initializeFileInput() {
    const isFolderMode = modeToggle.checked;
    
    if (isFolderMode) {
        fileInput.removeAttribute('accept');
        fileInput.removeAttribute('multiple');
        fileInput.setAttribute('webkitdirectory', '');
        fileInput.setAttribute('directory', '');
        fileInput.setAttribute('allowdirs', '');
        fileInput.setAttribute('title', 'Select a folder to load all .meta files inside it.');
    } else {
        fileInput.setAttribute('accept', '.meta');
        fileInput.setAttribute('multiple', '');
        fileInput.removeAttribute('webkitdirectory');
        fileInput.removeAttribute('directory');
        fileInput.removeAttribute('allowdirs');
        fileInput.setAttribute('title', 'Select one or more .meta files. Use "All Files" (*.*) if .meta isn\'t listed.');
    }

    // Ensure tooltip reflects initial state
    new bootstrap.Tooltip(fileInput);
}

// Run initialization on page load
document.addEventListener('DOMContentLoaded', initializeFileInput);

fileInput.addEventListener('change', handleFileSelect);

modeToggle.addEventListener('change', function() {
    const isFolderMode = this.checked;
    
    if (isFolderMode) {
        fileInput.removeAttribute('accept');
        fileInput.removeAttribute('multiple');
        fileInput.setAttribute('webkitdirectory', '');
        fileInput.setAttribute('directory', '');
        fileInput.setAttribute('allowdirs', '');
        fileInput.setAttribute('title', 'Select a folder to load all .meta files inside it.');
    } else {
        fileInput.setAttribute('accept', '.meta');
        fileInput.setAttribute('multiple', '');
        fileInput.removeAttribute('webkitdirectory');
        fileInput.removeAttribute('directory');
        fileInput.removeAttribute('allowdirs');
        fileInput.setAttribute('title', 'Select one or more .meta files. Use "All Files" (*.*) if .meta isn\'t listed.');
    }

    const tooltipInstance = bootstrap.Tooltip.getInstance(fileInput);
    if (tooltipInstance) {
        tooltipInstance.dispose();
    }
    new bootstrap.Tooltip(fileInput);
});

function handleFileSelect(e) {
    const files = e.target.files;
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    for (const file of files) {
        if (file.name.endsWith('.meta')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                loadedFiles[file.name] = event.target.result;
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.innerHTML = `<i class="fas fa-file-alt me-2"></i>${file.name}`;
                li.onclick = () => loadFile(file.name);
                fileList.appendChild(li);
            };
            reader.readAsText(file);
        }
    }
}

function loadFile(fileName) {
    const xmlText = loadedFiles[fileName];
    if (xmlText) {
        parseXML(xmlText, fileName);
    }
}

function parseXML(xmlText, fileName) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    weaponData = {
        fileName: fileName || 'untitled.meta',
        damage: xmlDoc.querySelector('Damage')?.getAttribute('value') || '0',
        weaponRange: xmlDoc.querySelector('WeaponRange')?.getAttribute('value') || '0',
        speed: xmlDoc.querySelector('Speed')?.getAttribute('value') || '0',
        maxHeadShotDistancePlayer: xmlDoc.querySelector('MaxHeadShotDistancePlayer')?.getAttribute('value') || '0',
        damageFallOffRangeMin: xmlDoc.querySelector('DamageFallOffRangeMin')?.getAttribute('value') || '0',
        damageFallOffRangeMax: xmlDoc.querySelector('DamageFallOffRangeMax')?.getAttribute('value') || '0',
        damageFallOffModifier: xmlDoc.querySelector('DamageFallOffModifier')?.getAttribute('value') || '0',
        originalXML: xmlText
    };

    document.getElementById('noDataEditor').style.display = 'none';
    document.getElementById('fields').style.display = 'flex';
    document.getElementById('noDataPreview').style.display = 'none';
    document.getElementById('xmlOutput').style.display = 'block';

    const fieldsDiv = document.getElementById('fields');
    fieldsDiv.innerHTML = `
        <div class="col-md-6 field">
            <label for="damage" class="form-label" data-bs-toggle="tooltip" data-bs-placement="top" 
                title="Base damage per shot. Higher values mean more damage (e.g., 35 = moderate, 50 = high).">Damage</label>
            <input type="number" id="damage" value="${weaponData.damage}" step="0.1" class="form-control">
        </div>
        <div class="col-md-6 field">
            <label for="weaponRange" class="form-label" data-bs-toggle="tooltip" data-bs-placement="top" 
                title="Max distance the bullet can travel (in units). Typical pistol range is 100-200.">Range</label>
            <input type="number" id="weaponRange" value="${weaponData.weaponRange}" step="0.1" class="form-control">
        </div>
        <div class="col-md-6 field">
            <label for="speed" class="form-label" data-bs-toggle="tooltip" data-bs-placement="top" 
                title="Bullet speed (units/sec). Higher = faster travel, less drop (e.g., 1700 = fast, 500 = slow).">Bullet Speed</label>
            <input type="number" id="speed" value="${weaponData.speed}" step="1" class="form-control">
        </div>
        <div class="col-md-6 field">
            <label for="maxHeadShotDistancePlayer" class="form-label" data-bs-toggle="tooltip" data-bs-placement="top" 
                title="Max distance for headshots to register (in units). Lower = harder (e.g., 50 = close range).">Headshot Range</label>
            <input type="number" id="maxHeadShotDistancePlayer" value="${weaponData.maxHeadShotDistancePlayer}" step="0.1" class="form-control">
        </div>
        <div class="col-md-4 field">
            <label for="damageFallOffRangeMin" class="form-label" data-bs-toggle="tooltip" data-bs-placement="top" 
                title="Distance where damage starts to decrease (in units). E.g., 40 = dropoff starts early.">Damage Falloff Start</label>
            <input type="number" id="damageFallOffRangeMin" value="${weaponData.damageFallOffRangeMin}" step="0.1" class="form-control">
        </div>
        <div class="col-md-4 field">
            <label for="damageFallOffRangeMax" class="form-label" data-bs-toggle="tooltip" data-bs-placement="top" 
                title="Distance where damage reaches its minimum (in units). E.g., 100 = full dropoff.">Damage Falloff End</label>
            <input type="number" id="damageFallOffRangeMax" value="${weaponData.damageFallOffRangeMax}" step="0.1" class="form-control">
        </div>
        <div class="col-md-4 field">
            <label for="damageFallOffModifier" class="form-label" data-bs-toggle="tooltip" data-bs-placement="top" 
                title="Damage multiplier at max falloff range. 1.0 = no drop, 0.5 = half damage.">Damage Falloff Modifier</label>
            <input type="number" id="damageFallOffModifier" value="${weaponData.damageFallOffModifier}" step="0.01" class="form-control">
        </div>
    `;

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    fieldsDiv.addEventListener('input', updateXML);
    updateXML();
}

function updateXML() {
    if (!weaponData) return;

    let updatedXML = weaponData.originalXML;
    updatedXML = updatedXML.replace(/<Damage value="[^"]*"/, `<Damage value="${document.getElementById('damage').value}"`);
    updatedXML = updatedXML.replace(/<WeaponRange value="[^"]*"/, `<WeaponRange value="${document.getElementById('weaponRange').value}"`);
    updatedXML = updatedXML.replace(/<Speed value="[^"]*"/, `<Speed value="${document.getElementById('speed').value}"`);
    updatedXML = updatedXML.replace(/<MaxHeadShotDistancePlayer value="[^"]*"/, `<MaxHeadShotDistancePlayer value="${document.getElementById('maxHeadShotDistancePlayer').value}"`);
    updatedXML = updatedXML.replace(/<DamageFallOffRangeMin value="[^"]*"/, `<DamageFallOffRangeMin value="${document.getElementById('damageFallOffRangeMin').value}"`);
    updatedXML = updatedXML.replace(/<DamageFallOffRangeMax value="[^"]*"/, `<DamageFallOffRangeMax value="${document.getElementById('damageFallOffRangeMax').value}"`);
    updatedXML = updatedXML.replace(/<DamageFallOffModifier value="[^"]*"/, `<DamageFallOffModifier value="${document.getElementById('damageFallOffModifier').value}"`);

    document.getElementById('xmlOutput').value = updatedXML;
}

function saveFile() {
    if (!weaponData) {
        alert('Please load a weapon meta file first!');
        return;
    }

    const updatedXML = document.getElementById('xmlOutput').value;
    downloadFile(updatedXML, weaponData.fileName);
}

function saveAsFile() {
    if (!weaponData) {
        alert('Please load a weapon meta file first!');
        return;
    }
    const modal = new bootstrap.Modal(document.getElementById('saveAsModal'));
    document.getElementById('saveFileName').value = weaponData.fileName;
    modal.show();
}

function confirmSaveAs() {
    const fileName = document.getElementById('saveFileName').value.trim();
    if (!fileName.endsWith('.meta')) {
        alert('File name must end with .meta!');
        return;
    }

    const updatedXML = document.getElementById('xmlOutput').value;
    downloadFile(updatedXML, fileName);
    weaponData.fileName = fileName;
    const modal = bootstrap.Modal.getInstance(document.getElementById('saveAsModal'));
    modal.hide();
}

function downloadFile(content, fileName) {
    const blob = new Blob([content], { type: 'text/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}