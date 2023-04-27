// //Components
// import { Disclosure } from '@headlessui/react';
// import SimpleRadioGroup from '@components/radio-group';
// import { ChevronDownIcon } from '@heroicons/react/24/outline';

// //Misc
// import classNames from 'classnames';
// import upperFirst from 'lodash.upperfirst';

// //Types
// import type { SimpleRadioGroupOption, SimpleRadioGroupProps } from '@components/radio-group';

// type SegmentOptionsProps = {
//   segmentGroup: string;
//   value?: string;
//   stateHandler: SimpleRadioGroupProps<SimpleRadioGroupOption>['stateHandler'];
//   options: string[];
// };

// const SegmentOptions = ({
//   segmentGroup,
//   value,
//   stateHandler,
//   options,
// }: SegmentOptionsProps) => (
//   <Disclosure as="div" className="mb-6" key={segmentGroup}>
//     {({ open }) => (
//       <>
//         <Disclosure.Button className="w-full flex justify-between items-start">
//           <p>{upperFirst(segmentGroup)}</p>
//           <p>
//             <ChevronDownIcon
//               className={classNames(open ? '-rotate-180' : 'rotate-0', 'h-6 w-6 transform')}
//               aria-hidden="true"
//             />
//           </p>
//         </Disclosure.Button>
//         <Disclosure.Panel as="div">
//           <SimpleRadioGroup
//             heading={segmentGroup}
//             name={segmentGroup}
//             value={value}
//             stateHandler={stateHandler}
//             srLegend
//             optionsContainerClassName="!mt-3 mb-3"
//             options={options}
//           />
//         </Disclosure.Panel>
//       </>
//     )}
//   </Disclosure>
// );

// export default SegmentOptions;
