/*jslint browser, for, this */
/*global $ */

function getPrices() {
    "use strict";
    return {
        prodOptions: {
            optElectronic: -100,
            optHardcover: 250,
            optPaper: 0
        },
        prodProperties: {
            propCertificate: 500,
            propPractice: 700
        },
        prodTypes: [450, 900, 2500]
    };
}

function updatePager() {
    "use strict";
    let currentPage = $(
        "#gallery-slider .slick-dots li.slick-active"
    ).index() + 1;
    let pagerElement = document.getElementById("gallery-pager");
    let totalPages = $("#gallery-slider .slick-dots li").length;

    if (pagerElement && totalPages > 0) {
        if (currentPage < 1) {
            currentPage = 1;
        }
        pagerElement.textContent = (
            "Страница: " + currentPage + " из " + totalPages
        );
    }
}

function initGallery() {
    "use strict";
    let slider = $("#gallery-slider");

    if (slider.length === 0) {
        return;
    }

    slider.on(
        "init reInit afterChange breakpoint setPosition",
        function () {
            updatePager();
        }
    );

    slider.slick({
        arrows: true,
        dots: true,
        infinite: true,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToScroll: 1,
                    slidesToShow: 1
                }
            }
        ],
        slidesToScroll: 3,
        slidesToShow: 3
    });

    updatePager();
}

function initFormValidation() {
    "use strict";
    let dobInput = document.getElementById("dob");
    let fullnameInput = document.getElementById("fullname");
    let phoneInput = document.getElementById("phone");
    let today = new Date().toISOString().split("T")[0];

    if (dobInput) {
        dobInput.setAttribute("max", today);
        dobInput.addEventListener("change", function () {
            if (dobInput.value > today) {
                dobInput.value = today;
            }
        });
    }

    if (fullnameInput) {
        fullnameInput.addEventListener("input", function () {
            fullnameInput.value = fullnameInput.value.replace(
                /[^A-Za-zА-Яа-яЁё\s\-]/g,
                ""
            );
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener("input", function () {
            phoneInput.value = phoneInput.value.replace(
                /[^0-9+\s\-()]/g,
                ""
            );
        });
    }
}

function updatePrice() {
    "use strict";
    let checkboxes = document.querySelectorAll(
        "#property-wrapper input[type=checkbox]"
    );
    let optionSelect = document.getElementById("calc-option");
    let optionsWrapper = document.getElementById("options-wrapper");
    let prices = getPrices();
    let propertyWrapper = document.getElementById("property-wrapper");
    let quantityInput = document.getElementById("calc-quantity");
    let radios = document.getElementsByName("serviceType");
    let rawQuantity = quantityInput.value.trim();
    let resultBox = document.getElementById("calc-result");
    let selectedType = "1";
    let total = 0;
    let unitPrice = 0;
    let validPattern = /^[1-9]\d*$/;

    radios.forEach(function (radio) {
        if (radio.checked) {
            selectedType = radio.value;
        }
    });

    if (selectedType === "1") {
        optionsWrapper.classList.add("d-none");
        propertyWrapper.classList.add("d-none");
    } else if (selectedType === "2") {
        optionsWrapper.classList.remove("d-none");
        propertyWrapper.classList.add("d-none");
    } else if (selectedType === "3") {
        optionsWrapper.classList.add("d-none");
        propertyWrapper.classList.remove("d-none");
    }

    if (!validPattern.test(rawQuantity)) {
        resultBox.innerHTML = (
            "<div class=\"alert alert-danger mb-0\">"
            + "Пожалуйста, введите корректное количество "
            + "(целое положительное число)."
            + "</div>"
        );
        return;
    }

    unitPrice = prices.prodTypes[parseInt(selectedType, 10) - 1] || 0;

    if (selectedType === "2" && optionSelect) {
        if (prices.prodOptions[optionSelect.value] !== undefined) {
            unitPrice += prices.prodOptions[optionSelect.value];
        }
    }

    if (selectedType === "3") {
        checkboxes.forEach(function (checkbox) {
            if (
                checkbox.checked
                && prices.prodProperties[checkbox.name] !== undefined
            ) {
                unitPrice += prices.prodProperties[checkbox.name];
            }
        });
    }

    total = unitPrice * parseInt(rawQuantity, 10);
    resultBox.innerHTML = (
        "<div class=\"alert alert-success mb-0 font-weight-bold\">"
        + "Итоговая стоимость услуги: " + total + " руб. "
        + "<span class=\"font-weight-normal text-muted\">("
        + rawQuantity + " шт. × " + unitPrice + " руб.)</span>"
        + "</div>"
    );
}

function initFeedbackPopup() {
    "use strict";
    let closeBtn = document.getElementById("popup-close-btn");
    let consentInput = document.getElementById("popup-consent");
    let emailInput = document.getElementById("popup-email");
    let form = document.getElementById("popup-feedback-form");
    let fullnameInput = document.getElementById("popup-fullname");
    let messageInput = document.getElementById("popup-message");
    let openButtons = document.querySelectorAll(".js-open-popup");
    let organizationInput = document.getElementById("popup-organization");
    let overlay = document.getElementById("popup-overlay");
    let phoneInput = document.getElementById("popup-phone");
    let popupHash = "#feedback-popup";
    let statusBox = document.getElementById("popup-status");
    let storageKey = "feedbackPopupFormData";
    let submitBtn = document.getElementById("popup-submit-btn");

    if (!overlay || !form) {
        return;
    }

    function showStatus(text, isError) {
        let alertClass = "alert alert-success mb-0 py-2 px-3";
        let box = null;

        if (isError) {
            alertClass = "alert alert-danger mb-0 py-2 px-3";
        }
        statusBox.innerHTML = "";
        if (text) {
            box = document.createElement("div");
            box.className = alertClass;
            box.textContent = text;
            statusBox.appendChild(box);
        }
    }

    function saveFormData() {
        let payload = {
            consent: consentInput.checked,
            email: emailInput.value,
            fullname: fullnameInput.value,
            message: messageInput.value,
            organization: organizationInput.value,
            phone: phoneInput.value
        };
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(payload));
        } catch (ignore) {
            return;
        }
    }

    function restoreFormData() {
        let parsed = null;
        let raw = null;
        try {
            raw = window.localStorage.getItem(storageKey);
        } catch (ignore) {
            return;
        }
        if (!raw) {
            return;
        }
        try {
            parsed = JSON.parse(raw);
        } catch (ignore) {
            return;
        }
        if (parsed && typeof parsed === "object") {
            fullnameInput.value = parsed.fullname || "";
            emailInput.value = parsed.email || "";
            phoneInput.value = parsed.phone || "";
            organizationInput.value = parsed.organization || "";
            messageInput.value = parsed.message || "";
            consentInput.checked = Boolean(parsed.consent);
        }
    }

    function clearFormData() {
        form.reset();
        try {
            window.localStorage.removeItem(storageKey);
        } catch (ignore) {
            return;
        }
    }

    function showPopupVisual() {
        overlay.hidden = false;
        document.body.classList.add("popup-open");
    }

    function hidePopupVisual() {
        overlay.hidden = true;
        document.body.classList.remove("popup-open");
    }

    function openPopup() {
        if (!overlay.hidden) {
            return;
        }
        showStatus("", false);
        showPopupVisual();
        if (window.location.hash !== popupHash) {
            window.history.pushState(
                {
                    popupOpen: true
                },
                "",
                popupHash
            );
        }
        fullnameInput.focus();
    }

    function closePopup() {
        if (overlay.hidden) {
            return;
        }
        if (
            window.location.hash === popupHash
            || (window.history.state && window.history.state.popupOpen)
        ) {
            window.history.back();
        } else {
            hidePopupVisual();
        }
    }

    openButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            openPopup();
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", function () {
            closePopup();
        });
    }

    overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
            closePopup();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !overlay.hidden) {
            closePopup();
        }
    });

    window.addEventListener("popstate", function () {
        if (
            window.location.hash === popupHash
            || (window.history.state && window.history.state.popupOpen)
        ) {
            showPopupVisual();
        } else {
            hidePopupVisual();
        }
    });

    form.addEventListener("input", function () {
        saveFormData();
    });

    form.addEventListener("change", function () {
        saveFormData();
    });

    form.addEventListener("submit", function (event) {
        let endpoint = form.getAttribute("action");
        let payload = {
            consent: consentInput.checked,
            email: emailInput.value.trim(),
            fullname: fullnameInput.value.trim(),
            message: messageInput.value.trim(),
            organization: organizationInput.value.trim(),
            phone: phoneInput.value.trim()
        };

        event.preventDefault();

        if (!endpoint || endpoint.indexOf("YOUR_FORM_ID") !== -1) {
            showStatus(
                "Укажите ваш URL формы Formcarry или Slapform "
                + "в атрибуте action в index.html.",
                true
            );
            return;
        }

        submitBtn.disabled = true;
        showStatus("Отправка сообщения...", false);

        window.fetch(endpoint, {
            body: JSON.stringify(payload),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            method: "POST"
        }).then(function (response) {
            return response.json().catch(function () {
                return {};
            }).then(function (data) {
                if (
                    response.ok
                    && (data.code === undefined || data.code === 200)
                ) {
                    clearFormData();
                    showStatus("Сообщение успешно отправлено!", false);
                } else {
                    showStatus(
                        data.message
                        || "Ошибка сервера при отправке формы.",
                        true
                    );
                }
            });
        }).catch(function () {
            showStatus(
                "Не удалось отправить данные. Проверьте подключение к сети.",
                true
            );
        }).then(function () {
            submitBtn.disabled = false;
        });
    });

    restoreFormData();

    if (window.location.hash === popupHash) {
        showPopupVisual();
    }
}

$(document).ready(function () {
    "use strict";
    let calcForm = document.getElementById("calc-form");
    let checkboxes = document.querySelectorAll(
        "#property-wrapper input[type=checkbox]"
    );
    let optionSelect = document.getElementById("calc-option");
    let quantityInput = document.getElementById("calc-quantity");
    let radios = document.getElementsByName("serviceType");

    if (calcForm) {
        calcForm.addEventListener("submit", function (event) {
            event.preventDefault();
        });
    }

    if (quantityInput) {
        quantityInput.addEventListener("input", function () {
            updatePrice();
        });
        quantityInput.addEventListener("change", function () {
            updatePrice();
        });
    }

    radios.forEach(function (radio) {
        radio.addEventListener("change", function () {
            updatePrice();
        });
    });

    if (optionSelect) {
        optionSelect.addEventListener("change", function () {
            updatePrice();
        });
    }

    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener("change", function () {
            updatePrice();
        });
    });

    initGallery();
    initFormValidation();
    updatePrice();
    initFeedbackPopup();
});