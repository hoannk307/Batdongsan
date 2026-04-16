import React from "react";
import { Range, getTrackBackground } from "react-range";
import { useDispatch, useSelector } from "react-redux";
import { Col, FormGroup, Label } from "reactstrap";
import { setPrice, setArea } from "@/redux-toolkit/reducers/inputsReducer";  

const RangeInputFields = ({ label, min, max, sm, lg }) => {
  const { symbol, currencyValue } = useSelector((state) => state.currencyReducer);
  const { price, area } = useSelector((state) => state.inputsReducer);
  const dispatch = useDispatch();

  // Step value
  const STEP = 1;

  // Fallback khi chưa có giá trị từ người dùng (initial state = null)
  const defaultMin = min || 1000;
  const defaultMax = max || 10000;
  const priceValues = price ?? [defaultMin, defaultMax];
  const areaValues = area ?? [defaultMin, defaultMax];

  return (
    <Col lg={lg || 12} sm={sm || 12}>
      <FormGroup>
        <div className='price-range'>
          <Label>
            {label} : {label === "Price" && `${symbol}`} {(label === "Area" ? areaValues[0] : priceValues[0] * currencyValue).toFixed(2)} - {label === "Price" && `${symbol}`} {(label === "Area" ? areaValues[1] : priceValues[1] * currencyValue).toFixed(2)} {label === "Area" && "sq ft"}
          </Label>
          <div className='theme-range-3' id={label === "Price" ? "slider-1" : "slider-2"}>
            <Range
              values={label === "Price" ? priceValues : areaValues}
              step={STEP}
              min={defaultMin}
              max={defaultMax}
              onChange={(values) => {
                if (label === "Price") {
                  dispatch(setPrice(values));
                } else if (label === "Area") {
                  dispatch(setArea(values));
                }
              }}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: "5px",
                    width: "100%",
                    borderRadius: "4px",
                    background: getTrackBackground({
                      values: label === "Price" ? priceValues : areaValues,
                      colors: ["#ccc", "var(--theme-default2)", "#ccc"],
                      min: defaultMin,
                      max: defaultMax,
                    }),
                    alignSelf: "center",
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props }) => {
                const { key, ...restProps } = props;
                const prop = { ...restProps };
                return (
                  <div key={key} {...prop}>
                    <div
                      style={{
                        height: "16px",
                        width: "8px",
                        borderRadius: "30%",
                        backgroundColor: "var(--theme-default2)",
                      }}
                    />
                  </div>
                );
              }}
            />
          </div>
        </div>
      </FormGroup>
    </Col>
  );
};

export default RangeInputFields;
