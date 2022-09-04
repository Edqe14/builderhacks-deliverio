/* eslint-disable @typescript-eslint/quotes */
import React, { useState } from 'react';

import { Tab } from '@headlessui/react';

import OverviewTab from './OverviewTab.jsx';
import SuppliesTab from './SuppliesTab';
import RetailTab from './RetailTab';
import WholesaleTab from './WholesaleTab';
import OnlineTab from './OnlineTab';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Tabs() {
  const [categories] = useState({
    Overview: <OverviewTab />,
    Supplies: <SuppliesTab />,
    Retail: <RetailTab />,
    Wholesale: <WholesaleTab />,
    Online: <OnlineTab />,
  });

  return (
    <div className="">
      <p className="cursor-pointer text-3xl font-medium text-slate-600 mt-10 mb-10 ml-3">
        Overview of the game
      </p>
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {Object.keys(categories).map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-grey-700',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white shadow'
                    : 'text-grey-700 hover:bg-white/[0.12] hover:text-grey-700'
                )
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel
            className={classNames(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            {categories.Overview}
          </Tab.Panel>
          <Tab.Panel
            className={classNames(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            {categories.Supplies}
          </Tab.Panel>
          <Tab.Panel
            className={classNames(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            {categories.Retail}
          </Tab.Panel>
          <Tab.Panel
            className={classNames(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            {categories.Wholesale}
          </Tab.Panel>
          <Tab.Panel
            className={classNames(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            {categories.Online}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
