import { useState } from "react";
import Select from "./Select";
import "./form.css"
const Form = () => {
  const countryToStatesMap = {
    India: ["Rajasthan", "Kerala", "Punjab"],
    America: ["Texas", "California", "Florida"],
    Canada: ["Ontario", "Quebec"]
  };

  const countries = Object.keys(countryToStatesMap);

  const states = [];
  for (const country in countryToStatesMap) {
    for (const state of countryToStatesMap[country]) {
    states.push({ name: state, country });
  }
}

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

  const getCountryByState = (stateName) => {
  for (const state of states) {
    if (state.name === stateName) {
      return state.country;
      }
    }
    return null;
  };

  const getDisabledStates = () => {
  if (selectedCountry === null) return [];

  const disabled = [];
  for (const state of states) {
    if (state.country !== selectedCountry) {
      disabled.push(state.name);
    }
  }
  return disabled;
};


  const getDisabledCountries = () => {
  if (selectedState === null) return [];

  const disabled = [];
  const allowedCountry = getCountryByState(selectedState);
  for (const country of countries) {
    if (country !== allowedCountry) {
      disabled.push(country);
    }
  }

  return disabled;
};

  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedCountry(getCountryByState(state));
  };
  const handleCountryChange = (country) => {
    setSelectedCountry(country);

    if (selectedState !== null) {
      const stateCountry = getCountryByState(selectedState);
      if (stateCountry !== country) {
        setSelectedState(null);
      }
    }
  };
  
return (
  <div className="form-container">
    <Select
      label="Select Country"
      options={countries}
      value={selectedCountry}
      onChange={handleCountryChange}
      onClear={() => {
        setSelectedCountry(null);
        setSelectedState(null);
      }}
      disabledOptions={getDisabledCountries()}
    />

    <Select
      label="Select State"
      options={states.map(s => s.name)}
      value={selectedState}
      onChange={handleStateChange}
      onClear={() => {
        setSelectedState(null);
        setSelectedCountry(null);
      }}
      disabledOptions={getDisabledStates()}
    />
  </div>
);

};

export default Form;
