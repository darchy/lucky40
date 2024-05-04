window.onmessage = (event) => {
    if (event.isTrusted === true && event.data === "CHECK_IOS_HAND") {
        showHand();
    }

    if (event.isTrusted === true && event.data === "CLOSE_IFRAME") {
        closeIFrame();
    }
};

function checkIOS(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor;

    if (/iPad|iPhone|iPod/.test(userAgent)) {
        return true;
    }

    return false;
}

function checkFirefox(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor;
    return /FxiOS/.test(userAgent);
}

function checkLandscape(): boolean {
    return window.innerWidth >= window.innerHeight;
}

function checkFullscreenIOS(): void {
    const height = Math.min(window.screen.width, window.screen.height);
    const isViewportMaximized = window.innerHeight / height >= 0.9;

    const overlay: HTMLElement | null = document.getElementById("overlay");
    const overlayHand: HTMLElement | null = document.getElementById("overlayHand");

    if (isViewportMaximized) {
        // document.getElementById("overlay").style.display = "none";
        // document.getElementById("overlayHand").style.display = "none";
        if (overlay !== null) {
            overlay.style.display = "none";
        }

        if (overlayHand !== null) {
            overlayHand.style.display = "none";
        }
    } else {
        // document.getElementById("overlay").style.display = "block";
        // document.getElementById("overlayHand").style.display = "block";
        if (overlay !== null) {
            overlay.style.display = "block";
        }

        if (overlayHand !== null) {
            overlayHand.style.display = "block";
        }

        window.scrollTo({ top: 0 });
    }
}

function showHand(): void {
    if (window.location.href !== window.parent.location.href) {
        return;
    }

    const iFrameBottom: HTMLElement | null = document.getElementById("iframeBottom");
    const overlay: HTMLElement | null = document.getElementById("overlay");
    const overlayHand: HTMLElement | null = document.getElementById("overlayHand");

    if (checkIOS() === true && checkFirefox() === false) {
        // document.getElementById("iframeBottom").style.display = "block";
        if (iFrameBottom !== null) {
            iFrameBottom.style.display = "block";
        }

        if (checkLandscape()) {
            // document.getElementById("overlay").style.display = "block";
            // document.getElementById("overlayHand").style.display = "block";
            if (overlay !== null) {
                overlay.style.display = "block";
            }

            if (overlayHand !== null) {
                overlayHand.style.display = "block";
            }
        }

        window.onresize = () => {
            checkFullscreenIOS();
        };
    } else if (checkIOS() === true && checkFirefox() === true) {
        resizeFirefoxIOS();

        window.onresize = () => {
            resizeFirefoxIOS();
        };
    }
}

function resizeFirefoxIOS(): void {
    const vw: number = checkLandscape() === false ? 100 : 90;
    // document.getElementById("gameFrame").style.width = `${vw}vw`;
    const gameFrame: HTMLElement | null = document.getElementById("gameFrame");

    if (gameFrame !== null) {
        gameFrame.style.width = `${vw}vw`;
    }
}

function closeIFrame(): void {
    window.location.href = "../";
}
