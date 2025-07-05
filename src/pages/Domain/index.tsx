import React, { useEffect, useState, useMemo } from 'react';
import { fetchDomains } from './api';

const Domains = () => {
  const [domains, setDomains] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchDomains()
      .then((res) => {
        console.log("✅ Domains fetched:", res); // ← Look in Console tab
        setDomains(res);
      })
      .catch((err) => console.error("❌ Error fetching domains:", err));
  }, []);

  const filteredDomains = useMemo(() => {
    return domains.filter((domain: any) =>
      domain.domainName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      domain.domainSource?.join(', ')?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [domains, searchTerm]);

  const totalPages = Math.ceil(filteredDomains.length / itemsPerPage);

  const paginatedDomains = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDomains.slice(start, start + itemsPerPage);
  }, [filteredDomains, currentPage, itemsPerPage]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white p-6">
      <h2 className="text-2xl font-bold mb-4">🌐 Domains</h2>

      <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-4">
        <div className="text-white text-sm">Total Domains: {filteredDomains.length}</div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search domain or source..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1 text-black rounded-md focus:outline-none"
          />
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1 text-black rounded-md focus:outline-none"
          >
            {[10, 20, 50, 100, 150].map((count) => (
              <option key={count} value={count}>
                Show {count}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="table-auto w-full border border-gray-700 text-sm shadow-md">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-2 border border-gray-700 text-left">SL No</th>
              <th className="px-4 py-2 border border-gray-700 text-left">Domain</th>
              <th className="px-4 py-2 border border-gray-700 text-left">Customer</th>
              <th className="px-4 py-2 border border-gray-700 text-left">Managed By</th>
              <th className="px-4 py-2 border border-gray-700 text-left">Source</th>
              <th className="px-4 py-2 border border-gray-700 text-left">Expiry</th>
              <th className="px-4 py-2 border border-gray-700 text-left">Locked</th>
              <th className="px-4 py-2 border border-gray-700 text-left">Original Registrar</th>
              <th className="px-4 py-2 border border-gray-700 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDomains.map((domain: any, index: number) => (
              <tr key={index} className="hover:bg-gray-800 transition-colors">
                <td className="px-4 py-2 border border-gray-700">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-4 py-2 border border-gray-700">{domain.domainName}</td>
                <td className="px-4 py-2 border border-gray-700">
                  {domain.customer?.name || 'N/A'}
                </td>
                <td className="px-4 py-2 border border-gray-700">{domain.managedBy}</td>
                <td className="px-4 py-2 border border-gray-700">
                  {domain.domainSource?.join(', ') || 'N/A'}
                </td>
                <td className="px-4 py-2 border border-gray-700">
                  {domain.expiryDate ? formatDate(domain.expiryDate) : 'N/A'}
                </td>
                <td className="px-4 py-2 border border-gray-700">{domain.lockStatus || 'N/A'}</td>
                <td className="px-4 py-2 border border-gray-700">{domain.originalRegistrar || 'N/A'}</td>
                <td className="px-4 py-2 border border-gray-700">
                  <span
                    className={`inline-block px-2 py-1 text-sm rounded font-semibold ${
                      domain.status?.toLowerCase() === 'active'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {domain.status || 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          disabled={currentPage === 1}
        >
          Prev
        </button>

        <span className="text-white px-3 py-1">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Domains;
