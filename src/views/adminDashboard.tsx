import React from "react";
import View from "./view";
import { useNavigate } from "react-router-dom";
import NotFound from "./notFound";
import Button from "../components/button";
import { pizzaService } from "../service/service";
import {
  Franchise,
  FranchiseList,
  Role,
  Store,
  User,
} from "../service/pizzaService";
import { TrashIcon } from "../icons";

interface Props {
  user: User | null;
}

export default function AdminDashboard(props: Props) {
  const navigate = useNavigate();
  const [franchiseList, setFranchiseList] = React.useState<FranchiseList>({
    franchises: [],
    more: false,
  });
  const [franchisePage, setFranchisePage] = React.useState(0);
  const filterFranchiseRef = React.useRef<HTMLInputElement>(null);
  const [userPage, setUserPage] = React.useState(0);
  const [users, setUsers] = React.useState<User[]>([]);
  const filterUserRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    (async () => {
      setFranchiseList(await pizzaService.getFranchises(franchisePage, 3, "*"));
    })();
  }, [props.user, franchisePage]);

  React.useEffect(() => {
    (async () => {
      const response = await pizzaService.listUsers(userPage, 10, "*");
      setUsers(response.users);
    })();
  }, [props.user, userPage]);

  function createFranchise() {
    navigate("/admin-dashboard/create-franchise");
  }

  async function closeFranchise(franchise: Franchise) {
    navigate("/admin-dashboard/close-franchise", {
      state: { franchise: franchise },
    });
  }

  async function closeStore(franchise: Franchise, store: Store) {
    navigate("/admin-dashboard/close-store", {
      state: { franchise: franchise, store: store },
    });
  }

  async function filterFranchises() {
    setFranchiseList(
      await pizzaService.getFranchises(
        franchisePage,
        10,
        `*${filterFranchiseRef.current?.value}*`,
      ),
    );
  }

  async function filterUsers() {
    setUserPage(0);
    const response = await pizzaService.listUsers(
      0,
      10,
      `*${filterUserRef.current?.value}*`,
    );
    setUsers(response.users);
  }

  async function deleteUser(user: User) {
    try {
      await pizzaService.deleteUser(user.id!);
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  }

  let response = <NotFound />;
  if (Role.isRole(props.user, Role.Admin)) {
    response = (
      <View title="Mama Ricci's kitchen">
        <div className="text-start py-8 px-4 sm:px-6 lg:px-8">
          <h3 className="text-neutral-100 text-xl">Users</h3>
          <div className="bg-neutral-100 overflow-clip my-4 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-400 text-neutral-100 uppercase border-b-2 border-gray-500">
                <tr>
                  {["Name", "Email", "Role", ""].map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-bold tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u, index) => (
                  <tr key={u.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {u.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(u.roles || []).map((r) => r.role).join(", ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteUser(u)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          ref={filterUserRef}
                          placeholder="Name"
                          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        />
                        <button
                          onClick={filterUsers}
                          className="px-4 py-1 text-sm font-medium rounded-md border border-orange-400 text-orange-400 hover:bg-orange-50"
                        >
                          Search
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          disabled={userPage === 0}
                          onClick={() => setUserPage(userPage - 1)}
                          className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() => setUserPage(userPage + 1)}
                          className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div className="text-start py-8 px-4 sm:px-6 lg:px-8">
          <h3 className="text-neutral-100 text-xl">Franchises</h3>
          <div className="bg-neutral-100 overflow-clip my-4">
            <div className="flex flex-col">
              <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="uppercase text-neutral-100 bg-slate-400 border-b-2 border-gray-500">
                        <tr>
                          {[
                            "Franchise",
                            "Franchisee",
                            "Store",
                            "Revenue",
                            "Action",
                          ].map((header) => (
                            <th
                              key={header}
                              scope="col"
                              className="px-6 py-3 text-center text-xs font-medium"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      {franchiseList.franchises.map((franchise, findex) => {
                        return (
                          <tbody
                            key={findex}
                            className="divide-y divide-gray-200"
                          >
                            <tr className="border-neutral-500 border-t-2">
                              <td className="text-start px-2 whitespace-nowrap text-l font-mono text-orange-600">
                                {franchise.name}
                              </td>
                              <td
                                className="text-start px-2 whitespace-nowrap text-sm font-normal text-gray-800"
                                colSpan={3}
                              >
                                {franchise.admins
                                  ?.map((o) => o.name)
                                  .join(", ")}
                              </td>
                              <td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
                                <button
                                  type="button"
                                  className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400  hover:border-orange-800 hover:text-orange-800"
                                  onClick={() => closeFranchise(franchise)}
                                >
                                  <TrashIcon />
                                  Close
                                </button>
                              </td>
                            </tr>

                            {franchise.stores.map((store, sindex) => {
                              return (
                                <tr key={sindex} className="bg-neutral-100">
                                  <td
                                    className="text-end px-2 whitespace-nowrap text-sm text-gray-800"
                                    colSpan={3}
                                  >
                                    {store.name}
                                  </td>
                                  <td className="text-end px-2 whitespace-nowrap text-sm text-gray-800">
                                    {store.totalRevenue?.toLocaleString()} ₿
                                  </td>
                                  <td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
                                    <button
                                      type="button"
                                      className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                                      onClick={() =>
                                        closeStore(franchise, store)
                                      }
                                    >
                                      <TrashIcon />
                                      Close
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        );
                      })}
                      <tfoot>
                        <tr>
                          <td className="px-1 py-1">
                            <input
                              type="text"
                              ref={filterFranchiseRef}
                              name="filterFranchise"
                              placeholder="Filter franchises"
                              className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
                            />
                            <button
                              type="submit"
                              className="ml-2 px-2 py-1 text-sm font-semibold rounded-lg border border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                              onClick={filterFranchises}
                            >
                              Submit
                            </button>
                          </td>
                          <td
                            colSpan={4}
                            className="text-end text-sm font-medium"
                          >
                            <button
                              className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300 "
                              onClick={() =>
                                setFranchisePage(franchisePage - 1)
                              }
                              disabled={franchisePage <= 0}
                            >
                              «
                            </button>
                            <button
                              className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300"
                              onClick={() =>
                                setFranchisePage(franchisePage + 1)
                              }
                              disabled={!franchiseList.more}
                            >
                              »
                            </button>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Button
            className="w-36 text-xs sm:text-sm sm:w-64"
            title="Add Franchise"
            onPress={createFranchise}
          />
        </div>
      </View>
    );
  }

  return response;
}
