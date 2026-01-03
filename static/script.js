
document.addEventListener("DOMContentLoaded", () => {
  // Disease page elements
  const imageInput = document.getElementById("imageInput");
  const preview = document.getElementById("preview");
  const previewWrap = document.getElementById("previewWrap");
  const uploadBtn = document.getElementById("uploadBtn");
  const resultDiv = document.getElementById("result");

  if (imageInput) {
    imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      preview.src = url;
      previewWrap.style.display = "block";
      resultDiv.innerHTML = "";
    });
  }

  if (uploadBtn) {
    uploadBtn.addEventListener("click", async () => {
      const file = imageInput.files && imageInput.files[0];
      if (!file) {
        resultDiv.innerHTML = "<strong style='color:#b91c1c'>Please choose an image first.</strong>";
        return;
      }
      resultDiv.innerHTML = "Uploading image and predicting...";
      try {
        const fd = new FormData();
        fd.append("image", file);

        const res = await fetch("/predict/plant", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) {
          resultDiv.innerHTML = "<strong>Error:</strong> " + (json.error||res.statusText);
          return;
        }

        if (json.healthy) {
          resultDiv.innerHTML = `<strong>Result:</strong> ${json.healthy} <br> Confidence: ${json.confidence.toFixed(2)}%`;
        } else {
          resultDiv.innerHTML = `<strong>Disease:</strong> ${json.disease} <br>
                                 <strong>Confidence:</strong> ${json.confidence.toFixed(2)}% <br>
                                 <strong>Cause:</strong> ${json.cause} <br>
                                 <strong>Symptoms:</strong> ${json.symptoms} <br>
                                 <strong>Treatment:</strong> ${json.treatment}`;
        }
      } catch (err) {
        resultDiv.innerHTML = "<strong>Network error:</strong> " + err.message;
      }
    });
  }

  // Irrigation page elements
  const fetchWeatherBtn = document.getElementById("fetchWeatherBtn");
  const locationInput = document.getElementById("location");
  const tempInput = document.getElementById("temperature");
  const soilInput = document.getElementById("soil_moisture");
  const pressureInput = document.getElementById("pressure");
  const altitudeInput = document.getElementById("altitude");
  const predictIrrBtn = document.getElementById("predictIrrBtn");
  const irrigResult = document.getElementById("irrigResult");

  if (fetchWeatherBtn) {
    fetchWeatherBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const loc = locationInput.value.trim();
      if (!loc) {
        irrigResult.innerHTML = "<strong style='color:#b91c1c'>Enter a location name first.</strong>";
        return;
      }
      irrigResult.innerHTML = "Fetching weather...";
      try {
        const res = await fetch(`/check_weather?location=${encodeURIComponent(loc)}`);
        const j = await res.json();
        if (!res.ok) {
          irrigResult.innerHTML = "<strong>Error:</strong> " + (j.error || res.statusText);
          return;
        }
        tempInput.value = j.temperature ?? "";
        pressureInput.value = j.pressure ?? "";
        altitudeInput.value = j.altitude ?? "";
        irrigResult.innerHTML = "Weather fetched. Modify values if needed, then Predict.";
      } catch (err) {
        irrigResult.innerHTML = "<strong>Network error:</strong> " + err.message;
      }
    });
  }

  if (predictIrrBtn) {
    predictIrrBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const payload = {
        temperature: tempInput.value,
        soil_moisture: soilInput.value,
        pressure: pressureInput.value,
        altitude: altitudeInput.value
      };
      irrigResult.innerHTML = "Sending data to model...";
      try {
        const res = await fetch("/predict/irrigation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const j = await res.json();
        if (!res.ok) {
          irrigResult.innerHTML = "<strong>Error:</strong> " + (j.error || res.statusText);
          return;
        }
        irrigResult.innerHTML = `<strong>Advice:</strong> ${j.prediction}`;
      } catch (err) {
        irrigResult.innerHTML = "<strong>Network error:</strong> " + err.message;
      }
    });
  }
});
