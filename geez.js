function InputStream(input) {
	var pos = 0,
		line = 1,
		col = 0;
	return {
		next: next,
		peek: peek,
		eof: eof,
		croak: croak,
	};
	function next() {
		var ch = input.charAt(pos++);
		if (ch == "\n") line++, (col = 0);
		else col++;
		return ch;
	}
	function peek() {
		return input.charAt(pos);
	}
	function eof() {
		return peek() == "";
	}
	function croak(msg) {
		throw new Error(msg + " (" + line + ":" + col + ")");
	}
}

function TokenStream(input) {
	var current = null;
	var keywords =
		" á‹­áˆáŠ• áŠ¨ á‹ˆá‹° áˆŒáˆ‹ áˆµáˆ« áˆµáˆ« áŠ¥á‹áŠá‰µ áˆ€áˆ°á‰µ ";
	return {
		next: next,
		peek: peek,
		eof: eof,
		croak: input.croak,
	};
	function is_keyword(x) {
		return keywords.indexOf(" " + x + " ") >= 0;
	}
	function is_digit(ch) {
		return /[0-9]/i.test(ch);
	}
	function is_id_start(ch) {
		return /[\u1200-\u135f\u1369-\u137ca-zA-Z0-9_]/u.test(ch);
	}
	function is_id(ch) {
		return is_id_start(ch) || "?!-<>=0123456789".indexOf(ch) >= 0;
	}
	function is_op_char(ch) {
		return "+-*/%=&|<>!".indexOf(ch) >= 0;
	}
	function is_punc(ch) {
		return "á£á¤(){}[]".indexOf(ch) >= 0;
	}
	function is_whitespace(ch) {
		return " \t\n".indexOf(ch) >= 0;
	}
	function read_while(predicate) {
		var str = "";
		while (!input.eof() && predicate(input.peek())) str += input.next();
		return str;
	}
	function read_number() {
		var has_dot = false;
		var number = read_while(function (ch) {
			if (ch == ".") {
				if (has_dot) return false;
				has_dot = true;
				return true;
			}
			return is_digit(ch);
		});
		return { type: "num", value: parseFloat(number) };
	}
	function read_ident() {
		var id = read_while(is_id);
		return {
			type: is_keyword(id) ? "kw" : "var",
			value: id,
		};
	}
	function read_escaped(end) {
		var escaped = false,
			str = "";
		input.next();
		while (!input.eof()) {
			var ch = input.next();
			if (escaped) {
				str += ch;
				escaped = false;
			} else if (ch == "\\") {
				escaped = true;
			} else if (ch == end) {
				break;
			} else {
				str += ch;
			}
		}
		return str;
	}
	function read_string() {
		return { type: "str", value: read_escaped('"') };
	}
	function skip_comment() {
		read_while(function (ch) {
			return ch != "\n";
		});
		input.next();
	}
	function read_next() {
		read_while(is_whitespace);
		if (input.eof()) return null;
		var ch = input.peek();
		if (ch == "#") {
			skip_comment();
			return read_next();
		}
		if (ch == '"') return read_string();
		if (is_digit(ch)) return read_number();
		if (is_id_start(ch)) return read_ident();
		if (is_punc(ch))
			return {
				type: "punc",
				value: input.next(),
			};
		if (is_op_char(ch))
			return {
				type: "op",
				value: read_while(is_op_char),
			};
		input.croak("áŠá‹°áˆ áˆ›áˆµá‰°áŠ“áŒˆá‹µ áŠ áˆá‰°á‰»áˆˆáˆá¥ " + ch);
	}
	function peek() {
		return current || (current = read_next());
	}
	function next() {
		var tok = current;
		current = null;
		return tok || read_next();
	}
	function eof() {
		return peek() == null;
	}
}

var FALSE = { type: "bool", value: false || "áˆ€áˆ°á‰µ" };
function parse(input) {
	var PRECEDENCE = {
		"=": 1,
		"||": 2,
		"&&": 3,
		"<": 7,
		">": 7,
		"<=": 7,
		">=": 7,
		"==": 7,
		"!=": 7,
		"+": 10,
		"-": 10,
		"*": 20,
		"/": 20,
		"%": 20,
	};
	return parse_toplevel();
	function is_punc(ch) {
		var tok = input.peek();
		return tok && tok.type == "punc" && (!ch || tok.value == ch) && tok;
	}
	function is_kw(kw) {
		var tok = input.peek();
		return tok && tok.type == "kw" && (!kw || tok.value == kw) && tok;
	}
	function is_op(op) {
		var tok = input.peek();
		return tok && tok.type == "op" && (!op || tok.value == op) && tok;
	}
	function skip_punc(ch) {
		if (is_punc(ch)) input.next();
		else
			input.croak(
				'áˆµáˆ­á‹á‰° áŠáŒ¥á‰¥ á‰ áˆ˜áŒ á‰ á‰… áˆ‹á‹­á¥ "' + ch + '"'
			);
	}
	function skip_kw(kw) {
		if (is_kw(kw)) input.next();
		else input.croak('á‰áˆá á‰ƒáˆ á‰ áˆ˜áŒ á‰ á‰… áˆ‹á‹­á¥ "' + kw + '"');
	}
	function skip_op(op) {
		if (is_op(op)) input.next();
		else input.croak('áˆµáˆŒá‰µ á‰ áˆ˜áŒ á‰ á‰… áˆ‹á‹­á¥"' + op + '"');
	}
	function unexpected() {
		input.croak("á‹«áˆá‰°á‰ á‰€ á‰ƒáˆá¥ " + JSON.stringify(input.peek()));
	}
	function maybe_binary(left, my_prec) {
		var tok = is_op();
		if (tok) {
			var his_prec = PRECEDENCE[tok.value];
			if (his_prec > my_prec) {
				input.next();
				return maybe_binary(
					{
						type: tok.value == "=" ? "assign" : "binary",
						operator: tok.value,
						left: left,
						right: maybe_binary(parse_atom(), his_prec),
					},
					my_prec
				);
			}
		}
		return left;
	}
	function delimited(start, stop, separator, parser) {
		var a = [],
			first = true;
		skip_punc(start);
		while (!input.eof()) {
			if (is_punc(stop)) break;
			if (first) first = false;
			else skip_punc(separator);
			if (is_punc(stop)) break;
			a.push(parser());
		}
		skip_punc(stop);
		return a;
	}
	function parse_call(func) {
		return {
			type: "call",
			func: func,
			args: delimited("(", ")", "á£", parse_expression),
		};
	}
	function parse_varname() {
		var name = input.next();
		if (name.type != "var") input.croak("Expecting variable name");
		return name.value;
	}

	function parse_if() {
		skip_kw("áŠ¨");
		var cond = parse_expression();
		if (!is_punc("{")) skip_kw("á‹ˆá‹°");
		var then = parse_expression();
		var ret = {
			type: "if",
			cond: cond,
			then: then,
		};
		if (is_kw("áˆŒáˆ‹")) {
			input.next();
			ret.else = parse_expression();
		}
		return ret;
	}
	function parse_lambda() {
		return {
			type: "lambda",
			name: input.peek().type == "var" ? input.next().value : null,
			vars: delimited("(", ")", "á£", parse_varname),
			body: parse_expression(),
		};
	}
	function parse_let() {
		skip_kw("á‹­áˆáŠ•");
		if (input.peek().type == "var") {
			var name = input.next().value;
			var defs = delimited("(", ")", "á£", parse_vardef);
			return {
				type: "call",
				func: {
					type: "lambda",
					name: name,
					vars: defs.map(function (def) {
						return def.name;
					}),
					body: parse_expression(),
				},
				args: defs.map(function (def) {
					return def.def || FALSE;
				}),
			};
		}
		return {
			type: "let",
			vars: delimited("(", ")", "á£", parse_vardef),
			body: parse_expression(),
		};
	}
	function parse_vardef() {
		var name = parse_varname(),
			def;
		if (is_op("=")) {
			input.next();
			def = parse_expression();
		}
		return { name: name, def: def };
	}
	function parse_bool() {
		return {
			type: "bool",
			value: input.next().value == "áŠ¥á‹áŠá‰µ",
		};
	}
	function maybe_call(expr) {
		expr = expr();
		return is_punc("(") ? parse_call(expr) : expr;
	}
	function parse_atom() {
		return maybe_call(function () {
			if (is_punc("(")) {
				input.next();
				var exp = parse_expression();
				skip_punc(")");
				return exp;
			}
			if (is_punc("{")) return parse_prog();
			if (is_kw("á‹­áˆáŠ•")) return parse_let();
			if (is_kw("áŠ¨")) return parse_if();
			if (is_kw("áŠ¥á‹áŠá‰µ") || is_kw("áˆ€áˆ°á‰µ")) return parse_bool();
			if (is_kw("áˆµáˆ«") || is_kw("áˆ¥áˆ«")) {
				input.next();
				return parse_lambda();
			}
			var tok = input.next();
			if (tok.type == "var" || tok.type == "num" || tok.type == "str")
				return tok;
			unexpected();
		});
	}
	function parse_toplevel() {
		var prog = [];
		while (!input.eof()) {
			prog.push(parse_expression());
			if (!input.eof()) {
				skip_punc("á¤");
			}
		}
		return { type: "prog", prog: prog };
	}
	function parse_prog() {
		var prog = delimited("{", "}", "á¤", parse_expression);
		if (prog.length == 0) return FALSE;
		if (prog.length == 1) return prog[0];
		return { type: "prog", prog: prog };
	}
	function parse_expression() {
		return maybe_call(function () {
			return maybe_binary(parse_atom(), 0);
		});
	}
}

function Environment(parent) {
	this.vars = Object.create(parent ? parent.vars : null);
	this.parent = parent;
}
Environment.prototype = {
	extend: function () {
		return new Environment(this);
	},
	lookup: function (name) {
		var scope = this;
		while (scope) {
			if (Object.prototype.hasOwnProperty.call(scope.vars, name))
				return scope;
			scope = scope.parent;
		}
	},
	get: function (name) {
		if (name in this.vars) return this.vars[name];
		throw new Error("á‹«áˆá‰°áˆ°á‹¨áˆ˜ áˆá‹‹áŒ­á¥ " + name);
	},
	set: function (name, value) {
		var scope = this.lookup(name);
		if (!scope && this.parent)
			throw new Error("á‹«áˆá‰°áˆ°á‹¨áˆ˜ áˆá‹‹áŒ­á¥ " + name);
		return ((scope || this).vars[name] = value);
	},
	def: function (name, value) {
		return (this.vars[name] = value);
	},
};

function evaluate(exp, env) {
	switch (exp.type) {
		case "num":
		case "str":
		case "bool":
			return exp.value;

		case "var":
			return env.get(exp.value);

		case "assign":
			if (exp.left.type != "var")
				throw new Error(
					"á‹­áˆ…áŠ• áˆ˜áˆ°á‹¨áˆ áŠ áˆá‰°á‰»áˆˆáˆá¥ " +
						JSON.stringify(exp.left)
				);
			return env.set(exp.left.value, evaluate(exp.right, env));

		case "binary":
			return apply_op(
				exp.operator,
				evaluate(exp.left, env),
				evaluate(exp.right, env)
			);

		case "lambda":
			return make_lambda(env, exp);

		case "let":
			exp.vars.forEach(function (v) {
				var scope = env.extend();
				scope.def(v.name, v.def ? evaluate(v.def, env) : false);
				env = scope;
			});
			return evaluate(exp.body, env);

		case "if":
			var cond = evaluate(exp.cond, env);
			if (cond !== false) return evaluate(exp.then, env);
			return exp.else ? evaluate(exp.else, env) : false;

		case "prog":
			var val = false;
			exp.prog.forEach(function (exp) {
				val = evaluate(exp, env);
			});
			return val;

		case "call":
			var func = evaluate(exp.func, env);
			return func.apply(
				null,
				exp.args.map(function (arg) {
					return evaluate(arg, env);
				})
			);

		default:
			throw new Error("I don't know how to evaluate " + exp.type);
	}
}

function apply_op(op, a, b) {
	function num(x) {
		if (typeof x != "number")
			throw new Error("á‰áŒ¥áˆ­ á‰°áŒ á‰¥á‰† áŒáŠ• " + x + "á‰°áŒˆáŠ˜á¢");
		return x;
	}
	function div(x) {
		if (num(x) == 0) throw new Error("á‰áŒ¥áˆ­ áˆˆ 0 áŠ á‹­áŠ«áˆáˆáˆá¢");
		return x;
	}
	switch (op) {
		case "+":
			return num(a) + num(b);
		case "-":
			return num(a) - num(b);
		case "*":
			return num(a) * num(b);
		case "/":
			return num(a) / div(b);
		case "%":
			return num(a) % div(b);
		case "&&":
			return a !== false && b;
		case "||":
			return a !== false ? a : b;
		case "<":
			return num(a) < num(b);
		case ">":
			return num(a) > num(b);
		case "<=":
			return num(a) <= num(b);
		case ">=":
			return num(a) >= num(b);
		case "==":
			return a === b;
		case "!=":
			return a !== b;
	}
	throw new Error("á‹¨á‰°áˆ³áˆ³á‰° áˆµáˆŒá‰µ áˆáˆáŠ­á‰µá¥ " + op);
}

function make_lambda(env, exp) {
	if (exp.name) {
		env = env.extend();
		env.def(exp.name, lambda);
	}
	function lambda() {
		var names = exp.vars;
		var scope = env.extend();
		for (var i = 0; i < names.length; ++i)
			scope.def(names[i], i < arguments.length ? arguments[i] : false);
		return evaluate(exp.body, scope);
	}
	return lambda;
}

/* -----[ entry point for NodeJS ]----- */

var globalEnv = new Environment();

globalEnv.def("time", function (func) {
	try {
		return func();
	} finally {
		console.timeEnd("time");
	}
});

if (typeof process != "undefined")
	(function () {
		globalEnv.def("áƒá", function (val) {
			console.log(val);
		});
		globalEnv.def("áˆ˜áˆµ_áƒá", function (val) {
			console.log(val, "/n");
		});
		var code = "";
		process.stdin.setEncoding("utf8");
		process.stdin.on("readable", function () {
			var chunk = process.stdin.read();
			if (chunk) code += chunk;
		});

		process.stdin.on("end", function () {
			var ast = parse(TokenStream(InputStream(code)));
			evaluate(ast, globalEnv);
		});
	})();
