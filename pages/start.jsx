/* eslint-disable @typescript-eslint/no-shadow */
import React, { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import { BsPlayFill } from 'react-icons/bs';
import { BiHelpCircle } from 'react-icons/bi';
import { FiSettings } from 'react-icons/fi';
import Layout from '@/components/Layout';

const people = [{ name: 'Easy' }, { name: 'Medium' }, { name: 'Hard' }];

function start() {
  const [selected, setSelected] = useState(people[0]);
  return (
    <Layout>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-start gap-5 p-40">
          <button class="rounded-full bg-indigo-700 p-4 inline-block">
            <BsPlayFill className="text-neutral-50" />
          </button>
          <button class="rounded-full bg-slate-100 p-4 inline-block shadow-sm">
            <BiHelpCircle className="text-indigo-700" />
          </button>
          <button class="rounded-full bg-slate-100 p-4 inline-block shadow-sm">
            <FiSettings className="text-indigo-700" />
          </button>
        </div>

        <div className="flex flex-col justify-between mt-5">
          <h1 className="cursor-pointer text-3xl font-medium text-indigo-600 mb-5 ">
            Jane's game
          </h1>

          <p className="text-xl mb-10">
            Hosted by
            <img className="" src="" alt="" />
          </p>
          <p className="text-xl text-red-400">Players up to 5</p>
          <div className="flex flex-row gap-2 mb-4">
            <img className="player-images w-100 h-100" src="" alt="" />
          </div>
          <div>
            <p className="text-xl text-red-400 mb-2">Settings</p>
            <Listbox value={selected} onChange={setSelected}>
              <div className="relative mt-1">
                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span className="block truncate">{selected.name}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <SelectorIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {people.map((person, personIdx) => (
                      <Listbox.Option
                        key={personIdx}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active
                              ? 'bg-amber-100 text-amber-900'
                              : 'text-gray-900'
                          }`
                        }
                        value={person}
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              {person.name}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
          <div className="">
            <a
              className="cursor-pointer p-2 rounded-2xl border-2 border-indigo-600 mt-2"
              href="/"
            >
              https://google.com/xxx
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default start;
