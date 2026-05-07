(async function autoDeleteLoop() {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let loopCount = 0;
    let scrollAttempts = 0;

    console.log("Starting advanced auto-delete loop...");

    while (true) {
        loopCount++;
        console.log(`\n--- Batch ${loopCount} ---`);

        // Look for standard checkboxes OR custom elements acting as checkboxes
        let checkboxes = document.querySelectorAll('input[type="checkbox"], [role="checkbox"]');
        
        // If none are found, try scrolling down to load more
        if (checkboxes.length === 0) {
            console.log("No checkboxes currently visible. Attempting to scroll to load more...");
            window.scrollTo(0, document.body.scrollHeight);
            await sleep(2000); // Wait for network to load new items
            scrollAttempts++;
            
            checkboxes = document.querySelectorAll('input[type="checkbox"], [role="checkbox"]');
            
            if (checkboxes.length === 0 && scrollAttempts >= 3) {
                console.log("Scrolled 3 times but no new items loaded. Finished!");
                break;
            } else if (checkboxes.length === 0) {
                continue; // Try looping/scrolling again
            }
        }
        
        // Reset scroll attempts if we found items
        scrollAttempts = 0;

        let selectedCount = 0;
        checkboxes.forEach(cb => {
            // Check standard 'checked' property or custom aria-checked attribute
            const isChecked = cb.checked || cb.getAttribute('aria-checked') === 'true';
            if (!isChecked) {
                cb.click();
                selectedCount++;
            }
        });

        if (selectedCount === 0) {
            console.log("Items found but couldn't be selected. Pausing briefly and trying scroll...");
            window.scrollTo(0, document.body.scrollHeight);
            await sleep(1500);
            continue;
        }

        console.log(`Selected ${selectedCount} items.`);
        await sleep(800); // Wait for the UI menu/delete button to appear

        // Click the main Delete button or icon
        const allElements = Array.from(document.querySelectorAll('button, div, span'));
        const deleteBtn = allElements.find(el => el.textContent.trim() === 'Delete') || 
                          document.querySelector('[aria-label="Delete"], [title="Delete"]');

        if (deleteBtn) {
            deleteBtn.click();
            console.log("Clicked the main Delete button.");
        } else {
            console.warn("Could not find the main Delete button. Stopping.");
            break;
        }

        await sleep(800); // Wait for the confirmation popup

        // Click the confirmation "Delete" button inside the popup
        const confirmBtn = Array.from(document.querySelectorAll('button')).reverse().find(el => 
            el.textContent.trim() === 'Delete' || el.textContent.trim() === 'Confirm' || el.textContent.trim() === 'Yes'
        );

        if (confirmBtn) {
            confirmBtn.click();
            console.log("Clicked the popup Confirmation button.");
        }

        // Wait for the deletion to process
        console.log("Waiting for the page to refresh items...");
        await sleep(3000); 
    }
})();
