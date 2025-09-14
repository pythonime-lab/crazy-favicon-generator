// Global variables
let customFont = null;
let uploadedImage = null;
let fontFileName = "Unknown Font";
let imageFileName = "Unknown Image";
let bgEffect = document.getElementById("bgEffect").value;
let effect = document.getElementById("effect").value;
let sketchyCirclePoints = null;
let shapePosition = { x: 0, y: 0 };
let textPosition = { x: 0, y: 0 };
// Initialize the application when fonts are ready
document.fonts.ready.then(() => {
  resetToDefaultsOnLoad(); // Reset to defaults on page load
  generateFavicon();
  generateHTMLSnippet();
});

// Image upload handler
document
  .getElementById("imageFile")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      updateImageInfo(file.name);
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          uploadedImage = img;
          generateFavicon();
          alert("✅ Image loaded successfully!");
        };
        img.onerror = function () {
          console.error("Image loading failed");
          alert("❌ Failed to load image.");
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

// Font upload handler
document
  .getElementById("fontFile")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      updateFontInfo(file.name, "Custom");
      const reader = new FileReader();
      reader.onload = function (event) {
        const fontFace = new FontFace("Custom", event.target.result);
        fontFace
          .load()
          .then(function (font) {
            document.fonts.add(font);
            customFont = font; // Fixed: was customFont = customFont
            generateFavicon();
            alert("✅ Font loaded successfully!");
          })
          .catch(function (error) {
            console.error("Font loading failed:", error);
            alert("❌ Failed to load font. Using fallback.");
          });
      };
      reader.readAsArrayBuffer(file);
    }
  });

// Auto-generate on input changes
[
  "letter",
  "bgColor1",
  "bgColor2",
  "textColor1",
  "textColor2",
  "size",
  "fontScale",
].forEach((id) => {
  document.getElementById(id).addEventListener("input", generateFavicon);
});

document
  .getElementById("shape")
  .addEventListener("change", generateFavicon);
document
  .getElementById("effect")
  .addEventListener("change", generateFavicon);
document
  .getElementById("bgEffect")
  .addEventListener("change", generateFavicon);

// Font scale slider handler
const fontSlider = document.getElementById("fontScale");
const fontScaleValue = document.getElementById("fontScaleValue");

fontSlider.addEventListener("input", () => {
  fontScaleValue.textContent = fontSlider.value;
  generateFavicon();
});

// Main favicon generation function
function generateFavicon() {
  const canvas = document.getElementById("faviconCanvas");
  const ctx = canvas.getContext("2d");
  const size = parseInt(document.getElementById("size").value);
  const letter = document.getElementById("letter").value;
  
  // Colors
  const bgColor1 = document.getElementById("bgColor1").value;
  const bgColor2 = document.getElementById("bgColor2").value;
  const textColor1 = document.getElementById("textColor1").value;
  const textColor2 = document.getElementById("textColor2").value;

  const shape = document.getElementById("shape").value;
  const effect = document.getElementById("effect").value;
  const bgEffect = document.getElementById("bgEffect").value;
  const fontScale = parseFloat(document.getElementById("fontScale").value);

  // Set canvas size
  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);

  // Enable high DPI rendering
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";


  if (uploadedImage) {
    // Apply transform for uploaded image
    ctx.save();
    ctx.translate(shapePosition.x, shapePosition.y);
    ctx.drawImage(uploadedImage, 0, 0, size, size);
    ctx.restore();
    document.getElementById("letter").value = "";
  } else {
    let fillStyle;

    ctx.save();
    ctx.translate(shapePosition.x, shapePosition.y);

    if (bgEffect === "solid") {
      fillStyle = bgColor1;
    } else if (bgEffect === "gradient") {
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, bgColor1);
      gradient.addColorStop(1, bgColor2);
      fillStyle = gradient;
    } else if (bgEffect === "radial") {
      const radial = ctx.createRadialGradient(
        size / 2,
        size / 2,
        10,
        size / 2,
        size / 2,
        size / 2
      );
      radial.addColorStop(0, bgColor1);
      radial.addColorStop(1, bgColor2);
      fillStyle = radial;
    } else if (bgEffect === "shadow") {
      ctx.shadowColor = bgColor2;
      ctx.shadowBlur = size * 0.1;
      ctx.shadowOffsetX = size * 0.05;
      ctx.shadowOffsetY = size * 0.05;
      fillStyle = bgColor1;
    } else if (bgEffect === "stroke") {
      // Draw background with stroke effect using the selected shape
      const shape = document.getElementById("shape").value;
      
      // Draw the shape with fill
      if (shape === "circle") {
        const lineWidth = size * 0.04;
        const radius = (size / 2) - (lineWidth / 2);
        
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = bgColor1;
        ctx.fill();
        ctx.strokeStyle = bgColor2;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.closePath();
        
      } else if (shape === "square") {
        const lineWidth = size * 0.04;
        const offset = lineWidth / 2; // Inset by half stroke width
        
        ctx.fillStyle = bgColor1;
        ctx.fillRect(offset, offset, size - lineWidth, size - lineWidth);
        ctx.strokeStyle = bgColor2;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(offset, offset, size - lineWidth, size - lineWidth);

      } else if (shape === "triangle") {
        const lineWidth = size * 0.04;
        const offset = lineWidth / 2;
        
        ctx.beginPath();
        ctx.moveTo(size / 2, offset); // Move down from top edge
        ctx.lineTo(size - offset, size - offset); // Move in from bottom-right
        ctx.lineTo(offset, size - offset); // Move in from bottom-left
        ctx.closePath();
        ctx.fillStyle = bgColor1;
        ctx.fill();
        ctx.strokeStyle = bgColor2;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

      } else if (shape === "rounded") {
        const lineWidth = size * 0.04;
        const offset = lineWidth / 2;
        const adjustedSize = size - lineWidth;
        const radius = adjustedSize * 0.2;

        ctx.beginPath();
        ctx.moveTo(radius + offset, offset);
        ctx.lineTo(adjustedSize - radius + offset, offset);
        ctx.quadraticCurveTo(adjustedSize + offset, offset, adjustedSize + offset, radius + offset);
        ctx.lineTo(adjustedSize + offset, adjustedSize - radius + offset);
        ctx.quadraticCurveTo(adjustedSize + offset, adjustedSize + offset, adjustedSize - radius + offset, adjustedSize + offset);
        ctx.lineTo(radius + offset, adjustedSize + offset);
        ctx.quadraticCurveTo(offset, adjustedSize + offset, offset, adjustedSize - radius + offset);
        ctx.lineTo(offset, radius + offset);
        ctx.quadraticCurveTo(offset, offset, radius + offset, offset);
        ctx.closePath();
        ctx.fillStyle = bgColor1;
        ctx.fill();
        ctx.strokeStyle = bgColor2;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

      } else if (shape === "sketchy-shape") {

        if (!sketchyCirclePoints || 
          sketchyCirclePoints.length === 0 || 
          sketchyCirclePoints.lastSize !== size) {

          sketchyCirclePoints = [];
          const points = 32;
          const centerX = size / 2;
          const centerY = size / 2;
          const radius = size / 2 - (size * 0.04); // Use 4% of size as offset instead of fixed 10px

          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const randomRadius = radius + (Math.random() - 0.5) * radius * 0.2;
            const x = centerX + Math.cos(angle) * randomRadius;
            const y = centerY + Math.sin(angle) * randomRadius;
            sketchyCirclePoints.push({ x, y });
          }
          sketchyCirclePoints.lastSize = size;
        }
        
        // Draw the sketchy shape with fill
        ctx.beginPath();
        sketchyCirclePoints.forEach((pt, i) => {
          if (i === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        });
        ctx.closePath();
        ctx.fillStyle = bgColor1;
        ctx.fill();
        ctx.strokeStyle = bgColor2;
        ctx.lineWidth = size / 3 * 0.04;
        ctx.stroke();
      }
      
      fillStyle = "transparent"; // Don't fill additional shape
      
    } else if (bgEffect === "none") {
      fillStyle = "transparent";
    }

    ctx.fillStyle = fillStyle;

    // Draw shapes (skip if stroke background is selected as it's already drawn above)
    if (bgEffect !== "stroke") {
      drawShape(ctx, shape, size, bgColor1, bgColor2, textColor2);
    }

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.restore();
  }

  // Set up text
  const fontSize = size * fontScale;
  const fontFamily = customFont || "Kalam";
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Measure text for better centering
  const textMetrics = ctx.measureText(letter);
  const ascent = textMetrics.actualBoundingBoxAscent;
  const descent = textMetrics.actualBoundingBoxDescent;
  const centerX = (size / 2) + textPosition.x;
  const centerY = (size / 2) + textPosition.y;
  const adjustedY = centerY + (ascent - descent) / 2;

  // Apply text effects
  applyTextEffect(ctx, effect, letter, centerX, adjustedY, textColor1, textColor2, size);

}

// Draw different shapes
function drawShape(ctx, shape, size, bgColor1, bgColor2, textColor2) {
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    ctx.fill();
  } else if (shape === "sketchy-shape") {
    // Check if we need to regenerate points for the current size
    if (!sketchyCirclePoints || 
      sketchyCirclePoints.length === 0 || 
      sketchyCirclePoints.lastSize !== size) {

      sketchyCirclePoints = [];
      const points = 32;
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size / 2 - (size * 0.04); // Use 4% of size as offset instead of fixed 10px

      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const randomRadius = radius + (Math.random() - 0.5) * radius * 0.2;
        const x = centerX + Math.cos(angle) * randomRadius;
        const y = centerY + Math.sin(angle) * randomRadius;
        sketchyCirclePoints.push({ x, y });
      }
      sketchyCirclePoints.lastSize = size;
    }
    
    ctx.beginPath();
    sketchyCirclePoints.forEach((pt, i) => {
      if (i === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    });
    ctx.closePath();
    ctx.fill();

  } else if (shape === "square") {
    ctx.fillRect(0, 0, size, size);
  } else if (shape === "triangle") {
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size, size);
    ctx.lineTo(0, size);
    ctx.closePath();
    ctx.fill();
  } else if (shape === "rounded") {
    const radius = size * 0.2;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();
  }
}

// Apply text effects
function applyTextEffect(ctx, effect, letter, centerX, adjustedY, textColor1, textColor2, size) {
  let gradientText = ctx.createLinearGradient(0, 0, size, 0);
  gradientText.addColorStop(0, textColor1);
  gradientText.addColorStop(1, textColor2);

  if (effect === "stroke") {
    ctx.lineWidth = size * 0.04;
    ctx.strokeStyle = textColor2;
    ctx.strokeText(letter, centerX, adjustedY);
    ctx.fillStyle = textColor1;
    ctx.fillText(letter, centerX, adjustedY);
  } else if (effect === "glow") {
    ctx.shadowColor = textColor2;
    ctx.shadowBlur = size * 0.1;
    ctx.fillStyle = textColor1;
    ctx.fillText(letter, centerX, adjustedY);
    ctx.shadowBlur = 0;
  } else if (effect === "gradient") {
    ctx.fillStyle = gradientText;
    ctx.fillText(letter, centerX, adjustedY);
  } else if (effect === "emboss") {
    ctx.fillStyle = textColor2;
    ctx.fillText(letter, centerX + size * 0.05, adjustedY + size * 0.05);
    ctx.fillStyle = textColor1;
    ctx.fillText(letter, centerX, adjustedY);
  } else {
    ctx.fillStyle = textColor1;
    ctx.fillText(letter, centerX, adjustedY);
  }
}

// Download functions
function downloadPNG() {
  const canvas = document.getElementById("faviconCanvas");
  const size = document.getElementById("size").value;
  const link = document.createElement("a");
  link.download = `favicon-${size}x${size}.png`;
  link.href = canvas.toDataURL();
  link.click();
}

async function downloadAll() {
  const sizes = [
    16, 32, 48, 64, 72, 96, 128, 144, 152, 180, 192, 256, 512,
  ];
  const originalSize = document.getElementById("size").value;
  const canvas = document.getElementById("faviconCanvas");

  for (let size of sizes) {
    try {
      // Update the size input
      document.getElementById("size").value = size;
      
      // Set canvas size
      canvas.width = size;
      canvas.height = size;
      
      // Set canvas style size for proper display
      canvas.style.width = size + "px";
      canvas.style.height = size + "px";
      
      // Generate favicon with the new size
      generateFavicon();
      
      // Wait for canvas to be ready
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Create and trigger download
      const link = document.createElement("a");
      link.download = `favicon-${size}x${size}.png`;
      link.href = canvas.toDataURL();
      link.click();

      // Wait between downloads
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Error generating ${size}x${size}:`, error);
    }
  }

  // Restore original size
  document.getElementById("size").value = originalSize;
  canvas.width = parseInt(originalSize);
  canvas.height = parseInt(originalSize);
  canvas.style.width = originalSize + "px";
  canvas.style.height = originalSize + "px";
  generateFavicon();

  alert("📦 All favicon sizes downloaded! Check your downloads folder.");
}

// Manifest and about.txt functions
function downloadManifestFile() {
  const manifest = {
    name: "",
    short_name: "",
    icons: generateManifestIcons(),
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
  };

  const content = JSON.stringify(manifest, null, 2);
  downloadTextFile(content, "manifest");
}

function getFontInfo() {
  if (customFont && fontFileName) {
    return {
      title: fontFileName.replace(/\.[^/.]+$/, ""),
      author: "undefined",
      source: "Custom uploaded font",
      license: "undefined",
    };
  }

  return {
    title: "Kalam",
    author: "Indian Type Foundry (Lipi Raval & Jonny Pinhorn)",
    source: "https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap",
    license: "SIL Open Font License 1.1",
  };
}

function generateManifestIcons() {
  const commonSizes = [
    16, 32, 48, 64, 72, 96, 128, 144, 152, 180, 192, 256, 512,
  ];
  return commonSizes.map((size) => ({
    src: `/android-chrome-${size}x${size}.png`,
    sizes: `${size}x${size}`,
    type: "image/png",
  }));
}

function downloadTextFile(content, filename) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Copy snippet functionality
const copyBtn = document.querySelector(".copy-btn");
copyBtn.addEventListener("click", copySnippet);

function copySnippet() {
  const snippet = document.getElementById("htmlSnippet").textContent;

  navigator.clipboard
    .writeText(snippet)
    .then(() => {
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("copied");

      setTimeout(() => {
        copyBtn.textContent = "Copy";
        copyBtn.classList.remove("copied");
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = snippet;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("copied");

      setTimeout(() => {
        copyBtn.textContent = "Copy";
        copyBtn.classList.remove("copied");
      }, 2000);
    });
}

// Generate HTML snippet
function generateHTMLSnippet() {
  const availableSizes = [
    512, 256, 192, 180, 152, 144, 128, 96, 72, 64, 48, 32, 16,
  ];

  const appName = "Update the app name.";
  const shortName = "Update the short name.";
  const description = "Update the description.";
  const themeColor = "#ffffff";
  const manifestPath = "/manifest.json";

  let snippet = "<!-- Add these lines to your HTML <head> section -->\n";

  snippet += `<meta charset="UTF-8">\n`;
  snippet += `<meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
  snippet += `<meta name="app-name" content="${appName}">\n`;
  snippet += `<meta name="short-name" content="${shortName}">\n`;
  snippet += `<meta name="description" content="${description}">\n`;
  snippet += `<meta name="theme-color" content="${themeColor}">\n\n`;

  // Manifest
  snippet += `<link rel="manifest" href="${manifestPath}">\n\n`;

  snippet += "<!-- Standard Favicons (for browsers) -->\n";

  [32, 16].forEach((size) => {
    snippet += `<link rel="icon" type="image/png" sizes="${size}x${size}" href="/favicon-${size}x${size}.png">\n`;
  });

  snippet += `\n<!-- Apple Touch Icons (for iOS/Safari) -->\n`;
  [180, 152, 144, 120, 76, 72].forEach((size) => {
    snippet += `<link rel="apple-touch-icon" sizes="${size}x${size}" href="/favicon-${size}x${size}.png">\n`;
  });

  snippet += `\n<!-- Android Chrome (via manifest.json) -->\n`;
  snippet += `<!-- These sizes should be in your manifest.json, not here -->\n\n`;

  snippet += `\n<!-- Windows Tiles -->\n`;
  snippet += `<meta name="msapplication-TileColor" content="${themeColor}">\n`;
  snippet += `<meta name="msapplication-TileImage" content="/favicon-144x144.png">\n`;

  // Inject into page
  document.getElementById("htmlSnippet").textContent = snippet;
}

// Update functions
function updateFontInfo(fileName, fontName) {
  fontFileName = fileName;
  customFont = fontName;
  generateHTMLSnippet();
}

function updateImageInfo(fileName) {
  imageFileName = fileName;
  generateHTMLSnippet();
}

// Reset to defaults function
function resetToDefaults() {
  // Reset input fields
  document.getElementById("letter").value = "CFG";
  document.getElementById("bgEffect").value = "stroke";
  document.getElementById("effect").value = "stroke";
  document.getElementById("imageFile").value = "";
  document.getElementById("fontFile").value = "";
  document.getElementById("shape").value = "sketchy-shape";
  document.getElementById("fontScale").value = "0.56";
  document.getElementById("size").value = "192";
  document.getElementById("textColor1").value = "#4A90E2";
  document.getElementById("textColor2").value = "#2D2D2D";
  document.getElementById("bgColor1").value = "#f4f1e8";
  document.getElementById("bgColor2").value = "#2D2D2D";
  shapePosition.x = 0;
  shapePosition.y = 0;
  textPosition.x = 0;
  textPosition.y = 0;
  
  // Reset global variables
  customFont = null;
  uploadedImage = null;
  fontFileName = "Unknown Font";
  imageFileName = "Unknown Image";
  sketchyCirclePoints = null;

  // Reset checkboxes
  const aboutCheckbox = document.getElementById("about-confirm");
  const manifestCheckbox = document.getElementById("manifest-confirm");
  if (aboutCheckbox) aboutCheckbox.checked = false;
  if (manifestCheckbox) manifestCheckbox.checked = false;

  // Reset buttons
  const copyBtn = document.getElementById("manifestBtn");
  const downloadAboutBtn = document.getElementById("downloadAbout");
  if (copyBtn) copyBtn.disabled = true;
  if (downloadAboutBtn) downloadAboutBtn.disabled = true;

  // Reset canvas favicon
  updateDisplay();
  generateFavicon();
}

// Reset to defaults on page load
function resetToDefaultsOnLoad() {
  // Always reset to defaults on browser reload
  document.getElementById("letter").value = "CFG";
  document.getElementById("bgEffect").value = "stroke";
  document.getElementById("effect").value = "stroke";
  document.getElementById("shape").value = "sketchy-shape";
  document.getElementById("fontScale").value = "0.56";
  document.getElementById("size").value = "192";
  document.getElementById("textColor1").value = "#4A90E2";
  document.getElementById("textColor2").value = "#2D2D2D";
  document.getElementById("bgColor1").value = "#f4f1e8";
  document.getElementById("bgColor2").value = "#2D2D2D";
  shapePosition.x = 0;
  shapePosition.y = 0;
  textPosition.x = 0;
  textPosition.y = 0;
  
  // Reset checkboxes on page reload (browser reload)
  const aboutCheckbox = document.getElementById("about-confirm");
  const manifestCheckbox = document.getElementById("manifest-confirm");
  if (aboutCheckbox) aboutCheckbox.checked = false;
  if (manifestCheckbox) manifestCheckbox.checked = false;
  
  // Update button states based on checkboxes
  const downloadBtn = document.getElementById("downloadAbout");
  const manifestBtn = document.getElementById("manifestBtn");
  if (downloadBtn) downloadBtn.disabled = true;
  if (manifestBtn) manifestBtn.disabled = true;
  
  // Clear any uploaded files
  document.getElementById("imageFile").value = "";
  document.getElementById("fontFile").value = "";
  
  // Reset global variables
  customFont = null;
  uploadedImage = null;
  fontFileName = "Unknown Font";
  imageFileName = "Unknown Image";
  sketchyCirclePoints = null;
  
  // Regenerate favicon with default settings (sketchy shape will be random)
  updateDisplay();
  generateFavicon();
}

// Event listeners for reset button
document.getElementById("resetDefaultsBtn").addEventListener("click", () => {
  resetToDefaultsOnLoad();
});

// Event listeners for download buttons
document.addEventListener("DOMContentLoaded", () => {
  // Download PNG button
  const downloadPNGBtn = document.getElementById("downloadPNGBtn");
  if (downloadPNGBtn) {
    downloadPNGBtn.addEventListener('click', downloadPNG);
  }
  
  // Download All button
  const downloadAllBtn = document.getElementById("downloadAllBtn");
  if (downloadAllBtn) {
    downloadAllBtn.addEventListener('click', downloadAll);
  }
});

// DOM Content Loaded event handler
document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("downloadAbout");
  const confirmCheckbox = document.getElementById("about-confirm");
  const warningBox = document.getElementById("about-warning");
  const manifestBtn = document.getElementById("manifestBtn");
  const manifestConfirm = document.getElementById("manifest-confirm");
  
  // Handle checkbox state changes
  confirmCheckbox.addEventListener("change", () => {
    downloadBtn.disabled = !confirmCheckbox.checked;
  });
  manifestConfirm.addEventListener("change", () => {
    manifestBtn.disabled = !manifestConfirm.checked;
  });
  
  // Handle clicks on disabled button using pointer events
  downloadBtn.addEventListener("pointerdown", (e) => {
    if (downloadBtn.disabled) {
      e.preventDefault();
      e.stopPropagation();
      
      // Shake the warning box
      warningBox.classList.remove("shake");
      void warningBox.offsetWidth; // force reflow
      warningBox.classList.add("shake");
      return false;
    }
  });

  manifestBtn.addEventListener("pointerdown", (e) => {
    if (manifestBtn.disabled) {
      e.preventDefault();
      e.stopPropagation();
      
      // Shake the warning box
      warningBox.classList.remove("shake");
      void warningBox.offsetWidth; // force reflow
      warningBox.classList.add("shake");
      return false;
    }
  });
  
  // Handle actual download when enabled
  downloadBtn.addEventListener("click", (e) => {
    if (downloadBtn.disabled) {
      return;
    }
    
    try {
      const fontInfo = getFontInfo();
      const content = `
##############################################################
# ⚠️ IMPORTANT REMINDER
# This about.txt was auto-generated by Crazy Favicon Generator.
# It may be incomplete.
#
# Before distributing, you MUST:
# - Verify the font author and license
# - Include the correct license file(s) if required
#
# Do NOT redistribute this file as-is without review.
##############################################################
This favicon was generated using the following font:
- Font Title: ${fontInfo.title}
- Font Author: ${fontInfo.author}
- Font Source: ${fontInfo.source}
- Font License: ${fontInfo.license}`;
      downloadTextFile(content, "about.txt");
    } catch (err) {
      console.error("Failed to generate about.txt:", err);
    }
  });

  // Handle actual manifest download/copy when enabled
  manifestBtn.addEventListener("click", (e) => {
    if (manifestBtn.disabled) {
      return;
    }
    
    try {
      const manifest = {
        name: "",
        short_name: "",
        icons: generateManifestIcons(),
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
      };
      
      const content = JSON.stringify(manifest, null, 2);
      downloadTextFile(content, "manifest");
    } catch (err) {
      console.error("Failed to generate manifest:", err);
    }
  });
});

let contentCounter = 6;
        
function addMoreContent() {
    const scrollContainer = document.getElementById('scrollContainer');
    const newItem = document.createElement('div');
    newItem.className = 'content-item';
    newItem.innerHTML = `
        <h3>Dynamic Content ${contentCounter}</h3>
        <p>This is additional content added to demonstrate the scrollbar functionality. Notice how the scrollbar thumb adjusts its size based on the content length. The sketchy design maintains its charm even with dynamic content.</p>
    `;
    scrollContainer.appendChild(newItem);
    contentCounter++;
    
    // Scroll to the new content
    newItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Add some subtle animation on page load
window.addEventListener('load', function() {
    const items = document.querySelectorAll('.content-item');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Position adjustment

const STEP_SIZE = 1;
let debounceTimer;

// Debounced redraw function
function debouncedGenerateFavicon() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    generateFavicon();
  }, 16); // ~60fps debounce
}

// Initialize all position controls
function initPositionControls() {
  // Background X position controls
  document.getElementById('bg-x-plus').addEventListener('click', function() {
    shapePosition.x += STEP_SIZE;
    updateDisplay();
    debouncedGenerateFavicon();
  });
  
  document.getElementById('bg-x-minus').addEventListener('click', function() {
    shapePosition.x -= STEP_SIZE;
    updateDisplay();
    debouncedGenerateFavicon();
  });
  
  // Background Y position controls
  document.getElementById('bg-y-plus').addEventListener('click', function() {
    shapePosition.y += STEP_SIZE;
    updateDisplay();
    debouncedGenerateFavicon();
  });
  
  document.getElementById('bg-y-minus').addEventListener('click', function() {
    shapePosition.y -= STEP_SIZE;
    updateDisplay();
    debouncedGenerateFavicon();
  });

  // Text X position controls
  document.getElementById('text-x-plus').addEventListener('click', function() {
    textPosition.x += STEP_SIZE;
    updateDisplay();
    debouncedGenerateFavicon();
  });
  
  document.getElementById('text-x-minus').addEventListener('click', function() {
    textPosition.x -= STEP_SIZE;
    updateDisplay();
    debouncedGenerateFavicon();
  });
  
  // Text Y position controls
  document.getElementById('text-y-plus').addEventListener('click', function() {
    textPosition.y += STEP_SIZE;
    updateDisplay();
    debouncedGenerateFavicon();
  });
  
  document.getElementById('text-y-minus').addEventListener('click', function() {
    textPosition.y -= STEP_SIZE;
    updateDisplay();
    debouncedGenerateFavicon();
  });
}

// Update all display values
function updateDisplay() {
  // Background position displays
  document.getElementById('bg-x-value').textContent = shapePosition.x;
  document.getElementById('bg-y-value').textContent = shapePosition.y;
  
  // Text position displays
  document.getElementById('text-x-value').textContent = textPosition.x;
  document.getElementById('text-y-value').textContent = textPosition.y;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  initPositionControls();
  updateDisplay();
});

let originalParent = null;
let originalNextSibling = null;
let isMovedToMobile = false;

function handleMobileElement() {
  const fixedElement = document.querySelector('.preview-section');
  const pageTitle = document.getElementById('pageTitle');
  
  if (!fixedElement || !pageTitle) {
    return;
  }
  
  // Store original position only once
  if (!originalParent) {
    originalParent = fixedElement.parentElement;
    originalNextSibling = fixedElement.nextElementSibling;
  }
  
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  if (isMobile && !isMovedToMobile) {
    // Move to mobile position (after h1)
    pageTitle.insertAdjacentElement('afterend', fixedElement);
    isMovedToMobile = true;
  } else if (!isMobile && isMovedToMobile) {
    // Move back to original position
    if (originalNextSibling) {
      originalParent.insertBefore(fixedElement, originalNextSibling);
    } else {
      originalParent.appendChild(fixedElement);
    }
    isMovedToMobile = false;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  handleMobileElement();
});

window.matchMedia('(max-width: 768px)').addEventListener('change', handleMobileElement);






