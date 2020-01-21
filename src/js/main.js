import html2canvas from "html2canvas";
import interact from "interactjs";
import FileSaver from "file-saver";
import tippy from "tippy.js";

tippy.setDefaultProps({
  arrow: true,
  delay: 0,
  duration: 0,
  theme: "light",
  allowHTML: true,
});

const flipImage = (image, scaleX) => {
  if (scaleX) {
    image.attr({ scaleX });
  }
  if (image.attr("scaleX") < 0) {
    const canvas = $("<canvas />").attr({ width: image.width(), height: image.height() }).get(0);
    const context = canvas.getContext("2d");
    const img = $("<img/>").attr({ src: image.attr("dataSrc") });
    context.translate(image.width(), 0);
    context.scale(image.attr("scaleX"), image.attr("scaleY"));
    context.drawImage(img.get(0), 0, 0, image.width(), image.height());
    const dataURL = canvas.toDataURL();
    image.attr({ src: dataURL });
  } else {
    image.attr({ src: image.attr("dataSrc") });
  }
};

const getCenter = () => {
  const center = $(".banner-center-center");
  const offset = center.offset();
  const width = center.width();
  const height = center.height();
  return { x: offset.left + width/2, y: offset.top + height/2 };
};

const setBannerTextStyle = () => {
  const container = $(".banner-container");
  const banner = $(".banner-text");
  const text = banner.text();
  const maxW = container.width() * 0.85;
  const maxH = container.height() * 0.85;
  const isLeftToRight = maxW >= maxH;
  const { x, y } = getCenter();

  const div = $("<div></div>").css({
    "font-size": "1em",
    "writing-mode": isLeftToRight ? "lr" : "tb",
  }).addClass("text-font").text(text);
  $(document.body).append(div);
  const w = div.width();
  const h = div.height();
  div.remove();

  banner.css({
    top: y,
    left: x,
    fontSize: `${Math.min(maxW/w, maxH/h)}em`,
    "writing-mode": isLeftToRight ? "lr" : "tb",
  });
};

const addSticker = (url) => {
  const container = $(".image-container");
  const image = $("<img/>").attr({
    src: url,
    dataSrc: url,
    tabIndex: 1,
    scaleX: 1,
    scaleY: 1,
  }).css({ height: 100, "z-index": 10, position: "absolute" });
  container.prepend(image);
  setDraggable(image.get(0));
  setResizable(image.get(0), { preserveAspectRatio: true, useTranslate: true });
  image.mouseover(function(e) { $(this).focus(); });
  image.bind("touchstart", function(e) { $(this).focus(); });
  image.keyup(function(e) {
    if (e.keyCode === 27 || e.keyCode === 8 || e.keyCode === 46) {
      $(this).remove();
    }
    if (e.keyCode === 37 || e.keyCode === 39) {
      flipImage($(this), image.attr("scaleX")*-1);
    }
  });
};

const setDraggable = (element, options = {}) => interact(element).draggable($.extend(true, {}, {
  restrict: {
    restriction: "parent",
    endOnly: false,
  },
  onmove: (e) => {
    const ele = $(e.target);
    const x = parseFloat(ele.attr("data-x") || 0) + e.dx;
    const y = parseFloat(ele.attr("data-y") || 0) + e.dy;
    ele.css({
      transform: `translate(${x}px, ${y}px)`
    }).attr({
      "data-x": x,
      "data-y": y,
    })
  },
}, options));

const setResizable = (element, options = {}) => interact(element).resizable($.extend(true, {}, {
  edges: {
    left: true,
    right: true,
    bottom: true,
    top: true,
  },
  restrictEdges: {
    outer: "parent",
    endOnly: false,
  },
  restrictSize: {
    min: { width: 50, height: 50 },
  },
}, options)).on("resizemove", (e) => {
  const ele = $(e.target);
  const x = parseFloat(ele.attr("data-x") || 0) + e.deltaRect.left;
  const y = parseFloat(ele.attr("data-y") || 0) + e.deltaRect.top;

  if (options.useTranslate) {
    ele.css({
      width: `${e.rect.width}px`,
      height: `${e.rect.height}px`,
      transform: `translate(${x}px, ${y}px)`,
    }).attr({
      "data-x": x,
      "data-y": y,
    });
  } else {
    // TODO: still need to optimize this
    const minWidth = (options.restrictSize && options.restrictSize.min && options.restrictSize.min.width) || 0;
    const minHeight = (options.restrictSize && options.restrictSize.min && options.restrictSize.min.height) || 0;
    ele.css({
      width: `${Math.max(e.rect.width + (e.edges.right?x:-x), minWidth)}px`,
      height: `${Math.max(e.rect.height + (e.edges.bottom?y:-y), minHeight)}px`,
    }).attr({
      "data-x": x,
      "data-y": y,
    });
  }

  setBannerTextStyle();
}).on("resizeend", (e) => {
  const ele = $(e.target);
  flipImage(ele);
});

const initStickers = () => {
  $(".sticker-picker ul").remove();
  $(".sticker-picker select").val("0").imagepicker({
    initialized: () => tippy(".sticker-picker .image_picker_selector img", {
      placement: "bottom",
      content: getTippyContent("#sticker-tooltip"),
    }),
    clicked: (select, e) => addSticker($(e.target).attr("src")),
  });
};

const getTippyContent = (selector) => $(selector).html();

$(function() {
  setResizable(".banner-container", {
    restrictEdges: {
      endOnly: true,
    },
    restrictSize: {
      min: { width: 320, height: 320 },
    },
  });

  $(".text-picker input").keyup((e) => {
    const currentText = $(".banner-text").text();
    const text = e.target.value;
    if (currentText !== text) {
      $(".banner-text").text(text || "");
      setBannerTextStyle();
    }
  });

  $(window).resize((e) => {
    setBannerTextStyle();
  });

  initStickers();

  tippy(".text-picker input", {
    placement: "top",
    content: getTippyContent("#text-tooltip"),
  });

  tippy(".banner-container", {
    placement: "left",
    content: getTippyContent("#banner-tooltip"),
  });

  tippy(".convert-button", {
    placement: "top",
    content: getTippyContent("#download-tooltip"),
  });

  setBannerTextStyle();

  $("#upload-button").change((e) => {
    try {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = ((f) => (e) => {
        const dataURL = e.target.result;
        const value = Math.random().toString(36);
        const option = $("<option />").attr({ "data-img-src": dataURL, value }).html(value);
        $(".sticker-picker select").append(option);
        initStickers();
      })(file);
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
    }
  });

  const otherContainers = $(".text-picker, .sticker-picker, .upload-button, .convert-button, .footer");
  $(".convert-button button").click((e) => {
    otherContainers.hide();
    window.scrollTo(0, 0);
    const container = $(".image-container");
    html2canvas(container.get(0)).then((canvas) => {
      canvas.toBlob((blob) => FileSaver.saveAs(blob, "和你揮.png"));
      otherContainers.show();
    });
  });
});
