import { PropTypes, Component } from 'react';
import { Status, Errors, Validator } from './type';
import Form from './form';
import Validators from './validators';

interface Props {
  name: string;
  children: (control: Control) => JSX.Element;

  [validator: string]: any;
};

interface State {
  status: Status;
  errors: Errors;
};

interface Context {
  form: Form
};

export default
class Control extends Component<Props, State> {
  props: Props;
  state: State;
  context: Context;

  static contextTypes = {
    form: PropTypes.object.isRequired
  };

  static propTypes = {
    name: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired
  };

  constructor(props: Props, context: Context) {
    super(props, context);

    this.state = { status: Status.INIT, errors: null };

    this.onChange = this.onChange.bind(this);
  }

  get value(): any { return this.context.form.getValue(this.props.name) || ''; }
  get form(): Form { return this.context.form; }
  get status(): Status { return this.context.form.getStatus(this.props.name); }
  get errors(): Errors { return this.context.form.getErrors(this.props.name); }
  get isInit() { return Status.INIT === this.status; }
  get isValid() { return Status.VALID === this.status; }
  get isInvalid() { return Status.INVALID === this.status; }

  componentWillMount() {
    this.context.form.addControl(this.props.name, this);    
  }

  componentWillUnmount() {
    this.context.form.removeControl(this.props.name);
  }

  onChange(value: any) {
    this.context.form.setValue(this.props.name, value);
  }

  runValidation(value: any): Errors {
    return Object
      .keys(this.props)
      .filter(Validators.has)
      .reduce((errors, v) => {
        const error = (Validators.get(v) as Validator)(value, this.props[v], this);

        if (null !== error && null !== errors) {
          Object.assign(errors, error);
        } else if (null !== error) {
          errors = (error as any);
        }

        return errors;
      }, null);
  }

  render() {
    return this.props.children(this);
  }
}