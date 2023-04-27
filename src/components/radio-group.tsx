import * as RadixRadioGroup from "@radix-ui/react-radio-group";

type RadioGroupProps = {
  options: string[];
  stateHandler: RadixRadioGroup.RadioGroupProps["onValueChange"];
  value: RadixRadioGroup.RadioGroupProps["value"];
};

const RadioGroup = ({ options, stateHandler, value }: RadioGroupProps) => {
  console.log("options", options);
  console.log("value", value);
  return (
    <RadixRadioGroup.Root
      className="flex flex-col gap-2.5"
      onValueChange={stateHandler}
      value={value}
    >
      {options.map((i) => {
        return <RadioGroupItem key={i} value={i} />;
      })}
    </RadixRadioGroup.Root>
  );
};

export default RadioGroup;

const RadioGroupItem = ({ value }: { value: string }) => (
  <div className="flex items-center">
    <RadixRadioGroup.Item
      className=" hover:bg-violet3 h-[25px] w-[25px] cursor-default rounded-full border  border-gray-300 bg-white outline-none"
      value={value}
      id={`r-${value}`}
    >
      <RadixRadioGroup.Indicator className="relative flex h-full w-full items-center justify-center after:block after:h-[11px] after:w-[11px] after:rounded-[50%] after:bg-blue-800 after:content-['']" />
    </RadixRadioGroup.Item>
    <label
      className="pl-[15px] text-[15px] leading-none "
      htmlFor={`r-${value}`}
    >
      {value}
    </label>
  </div>
);
