(()=>{var e={};e.id=380,e.ids=[380],e.modules={17:(e,t,s)=>{Promise.resolve().then(s.bind(s,1574))},378:()=>{},446:(e,t,s)=>{"use strict";s.r(t),s.d(t,{GlobalError:()=>n.a,__next_app__:()=>x,pages:()=>c,routeModule:()=>h,tree:()=>o});var r=s(5239),a=s(8088),i=s(8170),n=s.n(i),l=s(893),d={};for(let e in l)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(d[e]=()=>l[e]);s.d(t,d);let o={children:["",{children:["invoice",{children:["[id]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,3292)),"/Users/kartiksaxena/Code/laundry_service/test-app/src/app/invoice/[id]/page.tsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(s.bind(s,4431)),"/Users/kartiksaxena/Code/laundry_service/test-app/src/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,7398,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(s.t.bind(s,9999,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(s.t.bind(s,5284,23)),"next/dist/client/components/unauthorized-error"]}]}.children,c=["/Users/kartiksaxena/Code/laundry_service/test-app/src/app/invoice/[id]/page.tsx"],x={require:s,loadChunk:()=>Promise.resolve()},h=new r.AppPageRouteModule({definition:{kind:a.RouteKind.APP_PAGE,page:"/invoice/[id]/page",pathname:"/invoice/[id]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:o}})},846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},1135:()=>{},1574:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>o});var r=s(687),a=s(3210),i=s(6189),n=s(5814),l=s.n(n);s(2185);let d=`
  @media print {
    body { 
      margin: 0;
      padding: 0;
      font-size: 12px;
    }
    
    .print\\:hidden {
      display: none !important;
    }
    
    .invoice-table {
      width: 100% !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
    }
    
    .invoice-table th,
    .invoice-table td {
      border: 1px solid #e5e7eb !important;
      padding: 8px !important;
      word-wrap: break-word !important;
      overflow: hidden !important;
    }
    
    .invoice-table th:nth-child(1),
    .invoice-table td:nth-child(1) {
      width: 25% !important;
    }
    
    .invoice-table th:nth-child(2),
    .invoice-table td:nth-child(2) {
      width: 25% !important;
    }
    
    .invoice-table th:nth-child(3),
    .invoice-table td:nth-child(3) {
      width: 15% !important;
      text-align: center !important;
    }
    
    .invoice-table th:nth-child(4),
    .invoice-table td:nth-child(4) {
      width: 17.5% !important;
      text-align: right !important;
    }
    
    .invoice-table th:nth-child(5),
    .invoice-table td:nth-child(5) {
      width: 17.5% !important;
      text-align: right !important;
    }
    
    .price-cell {
      font-weight: bold !important;
      color: #000 !important;
    }
    
    .overflow-x-auto {
      overflow: visible !important;
    }
    
    .min-w-full {
      width: 100% !important;
    }
    
    .totals-section {
      width: 100% !important;
      margin-top: 20px !important;
    }
    
    .totals-table {
      width: 100% !important;
      max-width: 300px !important;
      margin-left: auto !important;
      border-collapse: collapse !important;
    }
    
    .totals-table td {
      border: 1px solid #e5e7eb !important;
      padding: 8px !important;
      font-size: 14px !important;
    }
    
    .total-row {
      font-weight: bold !important;
      background-color: #f9fafb !important;
    }
  }
`;function o(){let e=(0,i.useRouter)();(0,i.useParams)().id;let[t,s]=(0,a.useState)(null),[n,o]=(0,a.useState)(null),[c,x]=(0,a.useState)([]),[h,m]=(0,a.useState)(!0),[p,u]=(0,a.useState)(null);if(h)return(0,r.jsx)("div",{className:"min-h-screen flex items-center justify-center",children:(0,r.jsx)("div",{className:"animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"})});if(!t||!n||!p)return(0,r.jsx)("div",{className:"min-h-screen flex items-center justify-center",children:(0,r.jsxs)("div",{className:"text-center",children:[(0,r.jsx)("h1",{className:"text-2xl font-bold text-gray-900 mb-4",children:"Invoice Not Found"}),(0,r.jsx)(l(),{href:"/dashboard",className:"text-blue-600 hover:text-blue-800",children:"Return to Dashboard"})]})});let y=t.amount/1.08,g=.08*y,b=t.amount;return(0,r.jsxs)("div",{className:"min-h-screen bg-gray-50",children:[(0,r.jsx)("style",{dangerouslySetInnerHTML:{__html:d}}),(0,r.jsx)("header",{className:"bg-white shadow-sm border-b",children:(0,r.jsx)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:(0,r.jsxs)("div",{className:"flex justify-between items-center py-4",children:[(0,r.jsx)(l(),{href:"/dashboard",className:"text-2xl font-bold text-blue-600",children:"Laundry Service"}),(0,r.jsxs)("nav",{className:"flex space-x-8",children:[(0,r.jsx)(l(),{href:"/dashboard",className:"text-gray-600 hover:text-gray-900",children:"Dashboard"}),(0,r.jsx)(l(),{href:"/dashboard",className:"text-gray-600 hover:text-gray-900",children:"Schedule Pickup"}),(0,r.jsx)(l(),{href:"/dashboard",className:"text-gray-600 hover:text-gray-900",children:"My Orders"}),(0,r.jsx)(l(),{href:"/dashboard",className:"text-gray-600 hover:text-gray-900",children:"Invoices"}),(0,r.jsxs)("span",{className:"text-gray-600",children:["Hello, ",p.full_name]}),(0,r.jsx)("button",{onClick:()=>{localStorage.removeItem("token"),e.push("/login")},className:"text-gray-600 hover:text-gray-900",children:"Logout"})]})]})})}),(0,r.jsx)("div",{className:"max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8",children:(0,r.jsx)("div",{className:"bg-white shadow-lg rounded-lg overflow-hidden",children:(0,r.jsxs)("div",{className:"p-8",children:[(0,r.jsxs)("div",{className:"flex justify-between items-start mb-8",children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:"text-3xl font-bold text-gray-900 mb-2",children:"INVOICE"}),(0,r.jsxs)("p",{className:"text-gray-600",children:["#",t.id]})]}),(0,r.jsxs)("div",{className:"text-right",children:[(0,r.jsx)("h2",{className:"text-2xl font-bold text-blue-600 mb-2",children:"Laundry Service"}),(0,r.jsx)("p",{className:"text-gray-600",children:"123 Laundry Street"}),(0,r.jsx)("p",{className:"text-gray-600",children:"New York, NY 10001"}),(0,r.jsx)("p",{className:"text-gray-600",children:"contact@laundryservice.com"}),(0,r.jsx)("p",{className:"text-gray-600",children:"(555) 123-4567"})]})]}),(0,r.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-8 mb-8",children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h3",{className:"text-lg font-semibold text-gray-900 mb-4",children:"Bill To:"}),(0,r.jsxs)("div",{className:"text-gray-600",children:[(0,r.jsx)("p",{className:"font-medium text-gray-900",children:p.full_name}),(0,r.jsx)("p",{children:n.address.street}),(0,r.jsxs)("p",{children:[n.address.city,", ",n.address.state," ",n.address.zip_code]}),(0,r.jsxs)("p",{children:["Email: ",p.email]}),(0,r.jsxs)("p",{children:["Phone: ",p.phone_number]})]})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("h3",{className:"text-lg font-semibold text-gray-900 mb-4",children:"Invoice Details:"}),(0,r.jsxs)("div",{className:"space-y-2",children:[(0,r.jsxs)("div",{className:"flex justify-between",children:[(0,r.jsx)("span",{className:"text-gray-600",children:"Invoice Date:"}),(0,r.jsx)("span",{className:"text-gray-900",children:new Date(t.created_at).toLocaleDateString()})]}),(0,r.jsxs)("div",{className:"flex justify-between",children:[(0,r.jsx)("span",{className:"text-gray-600",children:"Payment Method:"}),(0,r.jsx)("span",{className:"text-gray-900",children:"Cash on Delivery"})]}),(0,r.jsxs)("div",{className:"flex justify-between",children:[(0,r.jsx)("span",{className:"text-gray-600",children:"Payment Status:"}),(0,r.jsx)("span",{className:`${"paid"===t.status?"text-green-600":"text-orange-600"}`,children:"paid"===t.status?"Paid":"Pending (Pay on Delivery)"})]}),(0,r.jsxs)("div",{className:"flex justify-between",children:[(0,r.jsx)("span",{className:"text-gray-600",children:"Pickup Date:"}),(0,r.jsx)("span",{className:"text-gray-900",children:new Date(n.created_at).toLocaleDateString()})]}),(0,r.jsxs)("div",{className:"flex justify-between",children:[(0,r.jsx)("span",{className:"text-gray-600",children:"Pickup Time:"}),(0,r.jsx)("span",{className:"text-gray-900",children:n.time_slot_id.includes("afternoon")?"Afternoon (1:00 PM - 5:00 PM)":"Morning (9:00 AM - 12:00 PM)"})]}),(0,r.jsxs)("div",{className:"flex justify-between",children:[(0,r.jsx)("span",{className:"text-gray-600",children:"Estimated Delivery:"}),(0,r.jsx)("span",{className:"text-green-600",children:new Date(t.estimated_delivery).toLocaleDateString()})]})]})]})]}),(0,r.jsxs)("div",{className:"mb-8",children:[(0,r.jsx)("h3",{className:"text-lg font-semibold text-gray-900 mb-4",children:"Service Details:"}),(0,r.jsx)("div",{className:"overflow-x-auto",children:(0,r.jsxs)("table",{className:"min-w-full divide-y divide-gray-200 invoice-table",children:[(0,r.jsx)("thead",{className:"bg-gray-50",children:(0,r.jsxs)("tr",{children:[(0,r.jsx)("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Item"}),(0,r.jsx)("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Service Type"}),(0,r.jsx)("th",{className:"px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Quantity"}),(0,r.jsx)("th",{className:"px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Unit Price"}),(0,r.jsx)("th",{className:"px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Total"})]})}),(0,r.jsx)("tbody",{className:"bg-white divide-y divide-gray-200",children:t.itemized_breakdown&&t.itemized_breakdown.length>0?t.itemized_breakdown.map((e,t)=>(0,r.jsxs)("tr",{children:[(0,r.jsx)("td",{className:"px-6 py-4 text-sm font-medium text-gray-900",children:e.item_name}),(0,r.jsx)("td",{className:"px-6 py-4 text-sm text-gray-500",children:e.service_type}),(0,r.jsx)("td",{className:"px-6 py-4 text-sm text-gray-900 text-center",children:e.quantity}),(0,r.jsxs)("td",{className:"px-6 py-4 text-sm text-gray-900 text-right price-cell",children:["₹",e.unit_price.toFixed(2)]}),(0,r.jsxs)("td",{className:"px-6 py-4 text-sm text-gray-900 text-right price-cell",children:["₹",e.total_price.toFixed(2)]})]},t)):(0,r.jsxs)("tr",{children:[(0,r.jsx)("td",{className:"px-6 py-4 text-sm font-medium text-gray-900",children:"Laundry Service"}),(0,r.jsx)("td",{className:"px-6 py-4 text-sm text-gray-500",children:"Professional laundry service"}),(0,r.jsx)("td",{className:"px-6 py-4 text-sm text-gray-900 text-center",children:"1"}),(0,r.jsxs)("td",{className:"px-6 py-4 text-sm text-gray-900 text-right price-cell",children:["₹",y.toFixed(2)]}),(0,r.jsxs)("td",{className:"px-6 py-4 text-sm text-gray-900 text-right price-cell",children:["₹",y.toFixed(2)]})]})})]})})]}),(0,r.jsx)("div",{className:"flex justify-end mb-8 totals-section",children:(0,r.jsx)("div",{className:"w-64",children:(0,r.jsx)("table",{className:"totals-table",children:(0,r.jsxs)("tbody",{children:[(0,r.jsxs)("tr",{children:[(0,r.jsx)("td",{className:"text-gray-600",children:"Subtotal:"}),(0,r.jsxs)("td",{className:"text-gray-900 text-right price-cell",children:["₹",y.toFixed(2)]})]}),(0,r.jsxs)("tr",{children:[(0,r.jsx)("td",{className:"text-gray-600",children:"Tax (8%):"}),(0,r.jsxs)("td",{className:"text-gray-900 text-right price-cell",children:["₹",g.toFixed(2)]})]}),(0,r.jsxs)("tr",{className:"total-row",children:[(0,r.jsx)("td",{className:"text-lg font-semibold text-gray-900",children:"Total:"}),(0,r.jsxs)("td",{className:"text-lg font-semibold text-blue-600 text-right price-cell",children:["₹",b.toFixed(2)]})]})]})})})}),(0,r.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t",children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h4",{className:"text-lg font-semibold text-gray-900 mb-2",children:"Notes:"}),(0,r.jsx)("p",{className:"text-gray-600",children:"Thank you for choosing our laundry service. We appreciate your business!"}),n.special_instructions&&(0,r.jsxs)("p",{className:"text-gray-600 mt-2",children:[(0,r.jsx)("strong",{children:"Special Instructions:"})," ",n.special_instructions]})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("h4",{className:"text-lg font-semibold text-gray-900 mb-2",children:"Terms & Conditions:"}),(0,r.jsxs)("ul",{className:"text-gray-600 text-sm space-y-1",children:[(0,r.jsx)("li",{children:"• Payment is due upon pickup of laundry."}),(0,r.jsx)("li",{children:"• Estimated delivery time may vary based on workload."}),(0,r.jsx)("li",{children:"• Please check your items before leaving."}),(0,r.jsx)("li",{children:"• We are not responsible for items left unclaimed for more than 30 days."})]})]})]}),(0,r.jsxs)("div",{className:"flex justify-center space-x-4 mt-8 pt-8 border-t print:hidden",children:[(0,r.jsx)("button",{onClick:()=>{window.print()},className:"bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700",children:"Print Invoice"}),(0,r.jsx)("button",{onClick:()=>{window.print()},className:"bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700",children:"Download PDF"}),(0,r.jsx)(l(),{href:"/dashboard",className:"bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700",children:"Back to Dashboard"})]})]})})})]})}},2185:(e,t,s)=>{"use strict";s.d(t,{F:()=>n});let r="http://localhost:8000";!r||r.startsWith("http://")||r.startsWith("https://")||(r=`https://${r}`);let a=()=>{let e=localStorage.getItem("token");return e?{Authorization:`Bearer ${e}`}:{}},i=async e=>{if(!e.ok){let t=await e.json().catch(()=>({}));throw Error(t.detail||t.message||"An error occurred")}return e.json()},n={register:async e=>i(await fetch(`${r}/users`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})),login:async e=>i(await fetch(`${r}/token`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({username:e.email,password:e.password})})),getCurrentUser:async()=>i(await fetch(`${r}/users/me`,{headers:a()})),getLaundryTypes:async()=>i(await fetch(`${r}/laundry-types`,{headers:a()})),async getTimeSlots(e){let t=e?`${r}/time-slots?date=${encodeURIComponent(e)}`:`${r}/time-slots`;return i(await fetch(t,{headers:a()}))},createPickupRequest:async e=>i(await fetch(`${r}/pickup-requests`,{method:"POST",headers:{"Content-Type":"application/json",...a()},body:JSON.stringify(e)})),getPickupRequests:async()=>i(await fetch(`${r}/pickup-requests`,{headers:a()})),getPickupRequest:async e=>i(await fetch(`${r}/pickup-requests/${e}`,{headers:a()})),getPaymentMethods:async()=>i(await fetch(`${r}/payment-methods`,{headers:a()})),createPayment:async e=>i(await fetch(`${r}/payments`,{method:"POST",headers:{"Content-Type":"application/json",...a()},body:JSON.stringify(e)})),getPayment:async e=>i(await fetch(`${r}/payments/${e}`,{headers:a()})),getInvoices:async()=>i(await fetch(`${r}/invoices`,{headers:a()})),getInvoiceByPaymentId:async e=>i(await fetch(`${r}/invoices/payment/${e}`,{headers:a()})),getInvoice:async e=>i(await fetch(`${r}/invoices/${e}`,{headers:a()}))}},2226:()=>{},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3292:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>r});let r=(0,s(2907).registerClientReference)(function(){throw Error("Attempted to call the default export of \"/Users/kartiksaxena/Code/laundry_service/test-app/src/app/invoice/[id]/page.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/kartiksaxena/Code/laundry_service/test-app/src/app/invoice/[id]/page.tsx","default")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},3873:e=>{"use strict";e.exports=require("path")},4431:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>i,metadata:()=>a});var r=s(7413);s(1135);let a={title:"Next.js",description:"Generated by Next.js"};function i({children:e}){return(0,r.jsx)("html",{lang:"en",children:(0,r.jsx)("body",{children:e})})}},6024:(e,t,s)=>{Promise.resolve().then(s.t.bind(s,6346,23)),Promise.resolve().then(s.t.bind(s,7924,23)),Promise.resolve().then(s.t.bind(s,5656,23)),Promise.resolve().then(s.t.bind(s,99,23)),Promise.resolve().then(s.t.bind(s,8243,23)),Promise.resolve().then(s.t.bind(s,8827,23)),Promise.resolve().then(s.t.bind(s,2763,23)),Promise.resolve().then(s.t.bind(s,7173,23))},6189:(e,t,s)=>{"use strict";var r=s(5773);s.o(r,"useParams")&&s.d(t,{useParams:function(){return r.useParams}}),s.o(r,"useRouter")&&s.d(t,{useRouter:function(){return r.useRouter}})},9121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},9176:(e,t,s)=>{Promise.resolve().then(s.t.bind(s,6444,23)),Promise.resolve().then(s.t.bind(s,6042,23)),Promise.resolve().then(s.t.bind(s,8170,23)),Promise.resolve().then(s.t.bind(s,9477,23)),Promise.resolve().then(s.t.bind(s,9345,23)),Promise.resolve().then(s.t.bind(s,2089,23)),Promise.resolve().then(s.t.bind(s,6577,23)),Promise.resolve().then(s.t.bind(s,1307,23))},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},9745:(e,t,s)=>{Promise.resolve().then(s.bind(s,3292))}};var t=require("../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[825,814],()=>s(446));module.exports=r})();