const body = document.body;
const root = document.documentElement;
const header = document.querySelector(".site-header");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");
const inPageLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
const placeholderLinks = document.querySelectorAll('a[href="#"]');
const sections = Array.from(document.querySelectorAll("main section[id]"));
const revealItems = document.querySelectorAll(
  ".reveal, .reveal-delay-1, .reveal-delay-2",
);
const tiltCards = document.querySelectorAll("[data-tilt]");
const projectCarousels = document.querySelectorAll("[data-projects-carousel]");
const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");
const year = document.getElementById("year");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const canHover = window.matchMedia(
  "(hover: hover) and (pointer: fine)",
).matches;

let currentActiveId = "";
let scrollTicking = false;

body.classList.add("has-interactions");

if (year) {
  year.textContent = new Date().getFullYear();
}

const getHeaderOffset = () => {
  if (window.innerWidth <= 820) {
    return 24;
  }

  if (!header) {
    return 96;
  }

  return Math.ceil(header.getBoundingClientRect().height) + 18;
};

const syncHeaderOffset = () => {
  root.style.setProperty("--header-offset", `${getHeaderOffset()}px`);
};

const setMenuState = (isOpen) => {
  if (!navMenu) {
    return;
  }

  const isBottomNav = window.innerWidth <= 820;
  void isOpen;

  navMenu.classList.toggle("open", isBottomNav);
  navMenu.setAttribute("aria-hidden", "false");

  if (navToggle) {
    navToggle.classList.remove("open");
    navToggle.hidden = true;
    navToggle.tabIndex = -1;
    navToggle.setAttribute("aria-label", "Open navigation");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-hidden", "true");
  }

  body.classList.remove("menu-open");
};

const syncHeaderState = () => {
  if (header) {
    header.classList.toggle("scrolled", window.scrollY > 12);
  }
};

const setActiveLink = (id) => {
  if (!id || id === currentActiveId) {
    return;
  }

  currentActiveId = id;

  navLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("active", active);

    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const getTargetScrollTop = (hash) => {
  if (hash === "#top") {
    return 0;
  }

  const target = document.querySelector(hash);

  if (!target) {
    return null;
  }

  return Math.max(
    target.getBoundingClientRect().top + window.scrollY - getHeaderOffset(),
    0,
  );
};

const scrollToHash = (
  hash,
  behavior = prefersReducedMotion ? "auto" : "smooth",
) => {
  const top = getTargetScrollTop(hash);

  if (top === null) {
    return;
  }

  window.scrollTo({ top, behavior });
};

const syncActiveSection = () => {
  if (sections.length === 0) {
    return;
  }

  const probe =
    window.scrollY +
    getHeaderOffset() +
    Math.min(window.innerHeight * 0.2, 160);

  let activeSection = sections[0];

  sections.forEach((section) => {
    if (probe >= section.offsetTop) {
      activeSection = section;
    }
  });

  if (
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 4
  ) {
    activeSection = sections[sections.length - 1];
  }

  setActiveLink(activeSection.id);
};

const handleScroll = () => {
  syncHeaderState();

  if (scrollTicking) {
    return;
  }

  scrollTicking = true;

  window.requestAnimationFrame(() => {
    syncActiveSection();
    scrollTicking = false;
  });
};

syncHeaderOffset();
syncHeaderState();
setActiveLink(currentActiveId);
setMenuState(false);

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    setMenuState(!navMenu.classList.contains("open"));
  });
}

inPageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");

    if (!hash || (!document.querySelector(hash) && hash !== "#top")) {
      return;
    }

    event.preventDefault();
    setMenuState(false);

    if (hash === "#top") {
      setActiveLink(sections[0]?.id ?? "");
    } else {
      setActiveLink(hash.slice(1));
    }

    window.requestAnimationFrame(() => {
      scrollToHash(hash);
    });
  });
});

placeholderLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.target === "_blank") {
      return;
    }

    event.preventDefault();
  });
});

window.addEventListener("scroll", handleScroll, { passive: true });

window.addEventListener("resize", () => {
  syncHeaderOffset();
  syncActiveSection();
  setMenuState(false);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);
  }
});

window.addEventListener("load", () => {
  syncHeaderOffset();
  syncActiveSection();

  if (window.location.hash && window.location.hash !== "#") {
    scrollToHash(window.location.hash, "auto");
  }
});

if ("IntersectionObserver" in window) {
  if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("reveal-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }
} else {
  revealItems.forEach((item) => item.classList.add("reveal-visible"));
}

if (canHover && !prefersReducedMotion) {
  tiltCards.forEach((card) => {
    let frameId = 0;

    const reset = () => {
      cancelAnimationFrame(frameId);
      card.style.transform = "";
    };

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        card.style.transform =
          `perspective(1000px) rotateX(${rotateX}deg) ` +
          `rotateY(${rotateY}deg) translateY(-4px)`;
      });
    });

    card.addEventListener("mouseleave", reset);
    card.addEventListener("blur", reset);
  });
}

const initProjectCarousel = (carousel) => {
  const viewport = carousel.querySelector("[data-carousel-viewport]");
  const track = carousel.querySelector("[data-carousel-track]");
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const cards = Array.from(track?.querySelectorAll(".project-card") ?? []);

  if (!viewport || !track || cards.length === 0) {
    return;
  }

  let autoSlideId = 0;
  let autoResumeId = 0;
  let autoDirection = 1;
  let isMouseDragging = false;
  let dragMoved = false;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;
  let suppressClickUntil = 0;

  const getMaxScroll = () =>
    Math.max(viewport.scrollWidth - viewport.clientWidth, 0);

  const setControlsState = () => {
    const scrollable = cards.length > 1 && getMaxScroll() > 4;

    [prevButton, nextButton].forEach((button) => {
      if (button) {
        button.disabled = !scrollable;
      }
    });
  };

  const getNearestCardIndex = () => {
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const distance = Math.abs(viewport.scrollLeft - card.offsetLeft);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  };

  const scrollToCard = (
    index,
    behavior = prefersReducedMotion ? "auto" : "smooth",
  ) => {
    const card = cards[index];

    if (!card) {
      return;
    }

    viewport.scrollTo({
      left: card.offsetLeft,
      behavior,
    });
  };

  const goToAdjacentCard = (direction) => {
    if (cards.length <= 1 || getMaxScroll() <= 4) {
      return;
    }

    const currentIndex = getNearestCardIndex();
    const targetIndex =
      (currentIndex + direction + cards.length) % cards.length;

    autoDirection = direction;
    scrollToCard(targetIndex);
  };

  const stopAutoSlide = () => {
    if (autoSlideId) {
      window.clearInterval(autoSlideId);
      autoSlideId = 0;
    }

    if (autoResumeId) {
      window.clearTimeout(autoResumeId);
      autoResumeId = 0;
    }
  };

  const startAutoSlide = () => {
    stopAutoSlide();

    if (prefersReducedMotion || cards.length <= 1 || getMaxScroll() <= 4) {
      setControlsState();
      return;
    }

    autoSlideId = window.setInterval(() => {
      const currentIndex = getNearestCardIndex();

      if (currentIndex >= cards.length - 1) {
        autoDirection = -1;
      } else if (currentIndex <= 0) {
        autoDirection = 1;
      }

      scrollToCard(currentIndex + autoDirection);
    }, 5200);
  };

  const scheduleAutoSlide = () => {
    stopAutoSlide();

    if (prefersReducedMotion || cards.length <= 1 || getMaxScroll() <= 4) {
      setControlsState();
      return;
    }

    autoResumeId = window.setTimeout(() => {
      startAutoSlide();
    }, 4200);
  };

  const endMouseDrag = (event) => {
    if (!isMouseDragging) {
      return;
    }

    isMouseDragging = false;
    carousel.classList.remove("is-dragging");

    if (
      typeof viewport.releasePointerCapture === "function" &&
      event.pointerId !== undefined &&
      typeof viewport.hasPointerCapture === "function" &&
      viewport.hasPointerCapture(event.pointerId)
    ) {
      viewport.releasePointerCapture(event.pointerId);
    }

    if (dragMoved) {
      suppressClickUntil = Date.now() + 350;
      scrollToCard(getNearestCardIndex());
    }

    dragMoved = false;
    scheduleAutoSlide();
  };

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      stopAutoSlide();
      goToAdjacentCard(-1);
      scheduleAutoSlide();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      stopAutoSlide();
      goToAdjacentCard(1);
      scheduleAutoSlide();
    });
  }

  viewport.addEventListener(
    "wheel",
    (event) => {
      const maxScroll = getMaxScroll();

      if (
        window.innerWidth <= 820 ||
        maxScroll <= 4 ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX)
      ) {
        return;
      }

      const atStart = viewport.scrollLeft <= 1;
      const atEnd = viewport.scrollLeft >= maxScroll - 1;

      if ((atStart && event.deltaY < 0) || (atEnd && event.deltaY > 0)) {
        return;
      }

      event.preventDefault();
      stopAutoSlide();
      viewport.scrollLeft += event.deltaY;
      scheduleAutoSlide();
    },
    { passive: false },
  );

  viewport.addEventListener("pointerdown", (event) => {
    if (
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      getMaxScroll() <= 4
    ) {
      return;
    }

    isMouseDragging = true;
    dragMoved = false;
    dragStartX = event.clientX;
    dragStartScrollLeft = viewport.scrollLeft;
    stopAutoSlide();
    carousel.classList.add("is-dragging");

    if (typeof viewport.setPointerCapture === "function") {
      viewport.setPointerCapture(event.pointerId);
    }
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!isMouseDragging) {
      return;
    }

    const deltaX = event.clientX - dragStartX;

    if (Math.abs(deltaX) > 6) {
      dragMoved = true;
    }

    viewport.scrollLeft = dragStartScrollLeft - deltaX;
  });

  viewport.addEventListener("pointerup", endMouseDrag);
  viewport.addEventListener("pointercancel", endMouseDrag);
  viewport.addEventListener("mouseleave", (event) => {
    if (isMouseDragging) {
      endMouseDrag(event);
    }
  });

  viewport.addEventListener(
    "touchstart",
    () => {
      stopAutoSlide();
    },
    { passive: true },
  );

  viewport.addEventListener(
    "touchend",
    () => {
      scheduleAutoSlide();
    },
    { passive: true },
  );

  viewport.addEventListener(
    "touchcancel",
    () => {
      scheduleAutoSlide();
    },
    { passive: true },
  );

  viewport.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stopAutoSlide();
      goToAdjacentCard(-1);
      scheduleAutoSlide();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      stopAutoSlide();
      goToAdjacentCard(1);
      scheduleAutoSlide();
    }
  });

  viewport.addEventListener(
    "scroll",
    () => {
      setControlsState();
    },
    { passive: true },
  );

  carousel.addEventListener("focusin", () => {
    stopAutoSlide();
  });

  carousel.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!carousel.contains(document.activeElement)) {
        scheduleAutoSlide();
      }
    }, 0);
  });

  if (canHover) {
    carousel.addEventListener("mouseenter", () => {
      stopAutoSlide();
    });

    carousel.addEventListener("mouseleave", () => {
      scheduleAutoSlide();
    });
  }

  carousel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      // Allow project-launch button ALWAYS
      if (event.target.closest(".project-launch")) {
        return;
      }

      if (Date.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  });
  window.addEventListener("resize", () => {
    setControlsState();

    if (getMaxScroll() <= 4) {
      stopAutoSlide();
      viewport.scrollTo({ left: 0, behavior: "auto" });
      return;
    }

    scrollToCard(getNearestCardIndex(), "auto");
    scheduleAutoSlide();
  });

  setControlsState();
  startAutoSlide();
};

projectCarousels.forEach((carousel) => {
  initProjectCarousel(carousel);
});

if (contactForm) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const defaultButtonLabel = submitButton?.textContent.trim() || "Send Message";

  const setFormNote = (message, state = "success") => {
    if (!formNote) {
      return;
    }

    formNote.textContent = message;
    formNote.dataset.state = state;
  };

  const setSubmitState = (isSubmitting) => {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? "Sending..." : defaultButtonLabel;
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      return;
    }

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      setFormNote("Please complete every field before sending.", "error");
      return;
    }

    formData.set("subject", `Portfolio inquiry from ${name}`);
    formData.set("from_name", name);
    formData.set("replyto", email);
    setSubmitState(true);
    setFormNote("Sending your message...", "success");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      let payload = null;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        payload = await response.json();
      }

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message || "Submission failed");
      }

      contactForm.reset();
      setFormNote(
        "Message sent successfully. I'll get back to you soon.",
        "success",
      );
    } catch (error) {
      setFormNote(
        error instanceof Error && error.message
          ? error.message
          : "The message could not be sent right now. Please try again in a moment.",
        "error",
      );
    } finally {
      setSubmitState(false);
    }
  });
}
