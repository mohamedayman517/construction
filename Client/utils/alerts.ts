import Swal from 'sweetalert2';

function withDir(opts: any, rtl: boolean) {
  if (!rtl) return opts;
  return {
    ...opts,
    didOpen: (el: HTMLElement) => {
      el.setAttribute('dir', 'rtl');
      if (typeof opts.didOpen === 'function') opts.didOpen(el);
    },
  };
}

export async function confirmDialog(message: string, confirmText = 'Yes', cancelText = 'Cancel', rtl = false): Promise<boolean> {
  const res = await Swal.fire(withDir({
    title: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  }, rtl));
  return !!res.isConfirmed;
}

export async function success(message: string, rtl = false) {
  return Swal.fire(withDir({ title: message, icon: 'success', confirmButtonText: 'OK' }, rtl));
}

export async function error(message: string, rtl = false) {
  return Swal.fire(withDir({ title: message, icon: 'error', confirmButtonText: 'OK' }, rtl));
}

export async function info(message: string, rtl = false) {
  return Swal.fire(withDir({ title: message, icon: 'info', confirmButtonText: 'OK' }, rtl));
}

export async function warning(message: string, rtl = false) {
  return Swal.fire(withDir({ title: message, icon: 'warning', confirmButtonText: 'OK' }, rtl));
}
