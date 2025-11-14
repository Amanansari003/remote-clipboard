const socket = io();
const form = document.querySelector('form');
const dataDiv = document.getElementById('data');
const displayArea = document.getElementById('displayArea');
const copyButton = document.getElementById('copyButton');

// Handle paste events to capture rich content
dataDiv.addEventListener('paste', (event) => {
  event.preventDefault();
  
  // Get clipboard data
  const clipboardData = event.clipboardData || window.clipboardData;
  
  // Check if there's HTML content
  const htmlData = clipboardData.getData('text/html');
  const textData = clipboardData.getData('text/plain');
  
  // Handle images
  const items = clipboardData.items;
  let imageHandled = false;
  
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.display = 'block';
          
          // Insert image at cursor position
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            
            // Move cursor after image
            range.setStartAfter(img);
            range.setEndAfter(img);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            dataDiv.appendChild(img);
          }
        };
        
        reader.readAsDataURL(blob);
        imageHandled = true;
      }
    }
  }
  
  // If no image was handled, insert HTML or plain text
  if (!imageHandled) {
    if (htmlData) {
      // Clean and insert HTML content
      const cleanedHtml = cleanPastedHtml(htmlData);
      document.execCommand('insertHTML', false, cleanedHtml);
    } else if (textData) {
      // Insert plain text
      document.execCommand('insertText', false, textData);
    }
  }
});

// Clean HTML to preserve formatting but remove unwanted styles
function cleanPastedHtml(html) {
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Remove script tags for security
  const scripts = temp.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  
  // Remove style attributes but keep structure
  const allElements = temp.querySelectorAll('*');
  allElements.forEach(el => {
    // Keep certain inline styles for images
    if (el.tagName === 'IMG') {
      const src = el.getAttribute('src');
      if (src) {
        el.style.maxWidth = '100%';
        el.style.height = 'auto';
        el.style.display = 'block';
      }
    } else {
      el.removeAttribute('style');
      el.removeAttribute('class');
    }
  });
  
  return temp.innerHTML;
}

// Form submission
form.addEventListener('submit', (event) => {
  event.preventDefault();
  
  // Get HTML content from contenteditable div
  const htmlContent = dataDiv.innerHTML;
  
  if (htmlContent.trim() === '') {
    alert('Please paste some content first!');
    return;
  }
  
  // Send HTML content via socket
  socket.emit('paste', htmlContent);
  
  // Clear the input
  dataDiv.innerHTML = '';
});

// Receive updates from other clients
socket.on('update', (data) => {
  displayArea.innerHTML = data;
});

// Enhanced copy button functionality with rich content and image support
copyButton.addEventListener('click', async () => {
  try {
    // Get all images in the display area
    const images = displayArea.querySelectorAll('img');
    const imagePromises = [];
    
    // Convert images to blobs for copying
    for (let img of images) {
      if (img.src.startsWith('data:')) {
        // Image is base64, convert to blob
        imagePromises.push(
          fetch(img.src)
            .then(res => res.blob())
            .catch(err => {
              console.error('Failed to fetch image:', err);
              return null;
            })
        );
      }
    }
    
    // Wait for all images to be converted
    const imageBlobs = await Promise.all(imagePromises);
    
    // Prepare clipboard items
    const clipboardItems = [];
    
    // Copy HTML content
    const htmlBlob = new Blob([displayArea.innerHTML], { type: 'text/html' });
    
    // Copy plain text content
    const plainText = displayArea.innerText || displayArea.textContent;
    const textBlob = new Blob([plainText], { type: 'text/plain' });
    
    // Create clipboard item with both HTML and plain text
    const clipboardData = {
      'text/html': htmlBlob,
      'text/plain': textBlob
    };
    
    // Add images to clipboard if available
    const validImageBlobs = imageBlobs.filter(blob => blob !== null);
    if (validImageBlobs.length > 0) {
      // Add first image to clipboard (browsers typically support one image)
      clipboardData[validImageBlobs[0].type] = validImageBlobs[0];
    }
    
    const clipboardItem = new ClipboardItem(clipboardData);
    
    // Write to clipboard
    await navigator.clipboard.write([clipboardItem]);
    
    // Visual feedback
    copyButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2" viewBox="0 0 16 16">
        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
      </svg>
      Copied!
    `;
    
    // Reset button after 2 seconds
    setTimeout(() => {
      copyButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
        </svg>
        Copy
      `;
    }, 2000);
    
  } catch (err) {
    console.error('Failed to copy content: ', err);
    
    // Fallback: try the older method
    try {
      const range = document.createRange();
      range.selectNodeContents(displayArea);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      document.execCommand('copy');
      selection.removeAllRanges();
      
      // Visual feedback
      copyButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2" viewBox="0 0 16 16">
          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
        </svg>
        Copied!
      `;
      
      setTimeout(() => {
        copyButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
          </svg>
          Copy
        `;
      }, 2000);
      
    } catch (fallbackErr) {
      console.error('Fallback copy also failed:', fallbackErr);
      alert('Failed to copy. Please try selecting and copying manually (Ctrl+C or Cmd+C).');
    }
  }
});