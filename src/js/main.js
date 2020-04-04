import html2canvas from "html2canvas";
import FileSaver from "file-saver";

document.addEventListener("DOMContentLoaded", (e) => {
  const otherDivs = [...document.querySelectorAll("body > div:not(.container)")];
  const container = document.querySelector(".container");
  const reactContainer = document.getElementById("react-container");
  const downloadBtn = document.getElementById("download-button");

  downloadBtn.addEventListener("click", (e) => {
    reactContainer.style.boxShadow = "none"; // TODO: a workaround for html2canvas bug #1856
    otherDivs.forEach((div) => div.style.display = "none");
    html2canvas(container, { scrollY: -window.scrollY }).then((canvas) => {
      reactContainer.style.boxShadow = "";
      otherDivs.forEach((div) => div.style.display = "");
      canvas.toBlob((blob) => FileSaver.saveAs(blob, "項生鬧得好寫得好.png"));
    });
  });

  const uploadBtn = document.getElementById("upload-button");
  const avatar = document.getElementById("avatar");
  uploadBtn.addEventListener("change", (e) => {
    try {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = ((f) => (e) => {
        const dataURL = e.target.result;
        avatar.src = dataURL;
      })(file);
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
    }
  });
});
